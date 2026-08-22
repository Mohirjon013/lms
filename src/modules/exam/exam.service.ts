import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { NotFound } from 'src/common/config/error';
import { JwtPayload } from 'src/common/config/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateTestDto } from './dto/create-test.dto';
import { CreateManyTestsDto } from './dto/create-many-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';

@Injectable()
export class ExamService {
    constructor(private prisma: PrismaService){}
    
    private async checkLessonOwnership(lessonId: number, user: JwtPayload){
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: lessonId },
            select: {
                section: {
                    select: {
                        course: {
                            select: {
                                assistantId: true,
                                teacher_profile: { select: { userId: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!lesson) NotFound('Lesson');
        
        const course = lesson.section.course;
        
        if (user.role === UserRole.TEACHER) {
            if (course.teacher_profile.userId !== user.id) throw new ForbiddenException('You can only manage exams in your own course');
            return;
        }
        
        if (user.role === UserRole.ASSISTANT) {
            if (course.assistantId !== user.id) throw new ForbiddenException('You can only manage exams in your own course');
            return;
        }
    }
    

    async createExam(payload:CreateTestDto, user:JwtPayload){
        await this.checkLessonOwnership(payload.lessonsId, user);
        
        const test = await this.prisma.tests.create({
            data: {
                lessonsId: payload.lessonsId,
                question: payload.question,
                variantA: payload.variantA,
                variantB: payload.variantB,
                variantC: payload.variantC,
                variantD: payload.variantD,
                answer: payload.answer,
            }
        });
        
        return { success: true, message:"Created exam successfully!" };
    }
    
    async createMany(payload: CreateManyTestsDto, user: JwtPayload) {
        await this.checkLessonOwnership(payload.lessonsId, user);
        
        const result = await this.prisma.tests.createMany({
            data: payload.tests.map((items) => ({ ...items, lessonsId: payload.lessonsId })),
        });
        return { success: true, data: { count: result.count } };
    }
    
    async getAllExamsByLesson(lessonId: number, user: JwtPayload) {
        await this.checkLessonOwnership(lessonId, user);
        
        const tests = await this.prisma.tests.findMany({
            where: { lessonsId: lessonId },
            orderBy: { created_at: 'asc' },
        });
        return { success: true, data: tests };
    }
    
    async updateExam(id: number, payload: UpdateTestDto, user: JwtPayload) {
        const exam = await this.prisma.tests.findUnique({
            where: { id }, select: { lessonsId: true },
        });
        if (!exam) NotFound('Exam');
        
        await this.checkLessonOwnership(exam.lessonsId, user);
        
        const updated = await this.prisma.tests.update({
            where: { id }, data: payload 
        });
        
        return { success: true, message:"Updated exam successfully!" };
    }
    
    async deleteExam(id: number, user: JwtPayload) {
        const test = await this.prisma.tests.findUnique({
            where: { id }, select: { lessonsId: true },
        });
        if (!test) NotFound('Exam');
        
        await this.checkLessonOwnership(test.lessonsId, user);
        
        await this.prisma.tests.delete({ where: { id } });
        return { success: true, message: "Delete exam successfully!" };
    }
    
}
