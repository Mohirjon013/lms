import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as argon from "argon2"
import { JwtToken } from 'src/common/config/jwt';
import { PaidVia, PaymentStatus, Status, UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import hashPassword from 'src/common/config/hash';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtToken: JwtToken
        
    ) {}
    
    async login(payload:LoginDto) {
        const existUser = await this.prisma.user.findFirst({
            where: {
                phone: payload.phone,
            },
        });
        
        if (!existUser) {
            throw new NotFoundException('User not found with this phone or password');
        }
        
        if(!await argon.verify(existUser.password,payload.password)){
            throw new NotFoundException('User not found with this phone or password');
        }
        
        if(existUser.status !== Status.ACTIVE){
            throw new ForbiddenException('Your account is not active. Please contact support.');
        }
        return {
            success:true,
            accessToken: await this.jwtToken.jwtAccessToken({id:existUser.id, full_name:existUser.full_name, role:existUser.role}),
            refreshToken: await this.jwtToken.jwtRefreshToken({id:existUser.id, full_name:existUser.full_name, role:existUser.role}),
            user: {
                id: existUser.id,
                full_name: existUser.full_name,
                role: existUser.role,
            }
        }
    }
    
    async register(payload:RegisterDto){
        const existUser = await this.prisma.user.findUnique({
            where: { phone: payload.phone },
        });
        
        if (existUser) {
            throw new ConflictException('User already exists with this phone');
        }
        
        const course = await this.prisma.courses.findUnique({
            where: { id: payload.courseId },
        });
        
        if (!course) {
            throw new NotFoundException('Course not found with this id');
        }
        
        await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    full_name: payload.full_name,
                    phone: payload.phone,
                    password: await hashPassword(payload.password),
                    status:Status.INACTIVE,
                    role: UserRole.STUDENT,
                },
            });
            await tx.purchasedCourse.create({
                data: {
                    userId: user.id,
                    courseId: payload.courseId,
                    amount: course.price,
                    status: PaymentStatus.PENDING,
                },
            });
        })
        
        return {
            success: true,
            message: "Ro'yxatdan o'tdingiz. To'lovingiz admin tomonidan tasdiqlangach tizimga kira olasiz.",
        }
    }
}
