import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/database/prisma.module';
import { SeederModule } from './core/seeders/seeder.module';
import { AdminsModule } from './modules/admin/admins.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CoursesModule } from './modules/courses/courses.module';
import { SectionsModule } from './modules/sections/sections.module';
import { LessonsModule } from './modules/lessons/lessons.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      global: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SeederModule,
    AuthModule,
    AdminsModule,
    TeachersModule,
    CategoriesModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
  ],
})
export class AppModule {}
