import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as agron from 'argon2';

@Injectable()
export class UserSeeder implements OnModuleInit {
  constructor(private readonly pirsma: PrismaService) {}

  async onModuleInit() {
    const existUser = await this.pirsma.user.findUnique({
      where: {
        phone: '+998930002329',
      },
    });
    if (existUser) {
      return Logger.log('✅ Superadmin already exists !!!');
    }
    await this.pirsma.user.create({
      data: {
        full_name: "Mohirjon To'ychiboyev",
        phone: '+998930002329',
        password: await agron.hash(process.env.USER_PASSWORD as string),
        role: 'SUPERADMIN',
      },
    });

    Logger.log('✅ Superadmin created !!!');
  }
}
