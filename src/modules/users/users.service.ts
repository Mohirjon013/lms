import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserRole } from '@prisma/client';
import hashPassword from 'src/common/config/hash';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createAdmin(payload: CreateAdminDto, filename?: string) {
    const existAdmin = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: payload.phone },
          { email: payload.email },
          // {}
        ],
      },
    });

    if (existAdmin) {
      throw new ConflictException(
        'Admin already exists with this phone or email',
      );
    }

    await this.prisma.user.create({
      data: {
        ...payload,
        role: UserRole.ADMIN,
        password: await hashPassword(payload.password),
        file: filename || null,
      },
    });

    return {
      success: true,
      message: 'Admin created successfully!',
    };
  }
}
