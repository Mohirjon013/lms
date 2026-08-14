import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { PurchaseDto } from './dto/purchase.dto';
import { PaymentStatus, Status } from '@prisma/client';

@Injectable()
export class PaymentService {
    constructor(private prisma:PrismaService){}
    
    async purchase(payload:PurchaseDto,id:number){
        const course = await this.prisma.courses.findUnique({
            where: { id: payload.courseId },
        });
        
        if (!course) {
            throw new NotFoundException('Course not found with this id');
        }
        
        const existStudent = await this.prisma.purchasedCourse.findUnique({
            where:{
                userId_courseId:{userId:id, courseId:payload.courseId}
            }
        })
        
        if(existStudent){
            if (existStudent.status === PaymentStatus.COMPLETED) {
                return {
                    message:"You have already purchased this course",
                    courseId: payload.courseId,
                    alreadyPurchased: true,
                }
            }
            throw new ConflictException('Your payment for this course is pending confirmation');
        }
        
        await this.prisma.purchasedCourse.create({
            data:{
                userId:id,
                courseId:payload.courseId,
                amount:course.price,
                status: PaymentStatus.PENDING
            }
        })
        
        return {
            success: true,
            message: 'Course purchase request created. Please wait for admin confirmation.',
        };
    }
    
    async confirmPayment(id:number){
        const payment = await this.prisma.purchasedCourse.findUnique({
            where:{id}
        })
        
        if(!payment){
            throw new NotFoundException('Payment not found with this id');
        }
        
        if (payment.status === PaymentStatus.COMPLETED) {
            throw new ConflictException('This payment is already confirmed');
        }
        
        await this.prisma.$transaction(async (tx) => {
            await tx.purchasedCourse.update({
                where:{id},
                data:{status:PaymentStatus.COMPLETED}
            })
            
            
            const user = await tx.user.findUnique({
                where: { id: payment.userId },
            });
            
            if(user?.status === Status.INACTIVE){
                await tx.user.update({
                    where: { id: payment.userId },
                    data: { status: Status.ACTIVE },
                });
            }
        })
        
        return {
            success: true,
            message: 'Payment confirmed successfully!',
        };
    }
    
    async getAllPayments(page:number, limit:number){
        const skip = (page - 1) * limit;
        
        const [payments, total] = await this.prisma.$transaction([
            this.prisma.purchasedCourse.findMany({
                skip: Number(skip),
                take: Number(limit),
                orderBy: { purchasedAt: 'desc' },
                select: {
                    id:true,
                    userId: true,
                    courseId: true,
                    amount: true,
                    status: true,
                    purchasedAt: true,
                    user: {
                        select: {
                            id: true,
                            full_name: true,
                            phone:true,
                            status:true
                        },
                    },
                    course: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            this.prisma.purchasedCourse.count(),
        ]);
        
        return {
            success:true,
            total,
            page: Number(page),
            limit: Number(limit),
            data: payments,
        }
    }
}
