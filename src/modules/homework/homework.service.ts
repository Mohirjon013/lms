import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { HomeworkSubStatus, UserRole } from '@prisma/client';
import { NotFound } from 'src/common/config/error';
import { JwtPayload } from 'src/common/config/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import fs, { stat } from "fs"
import { join } from 'path';
import { runInContext } from 'vm';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

@Injectable()
export class HomeworkService {
    constructor(private prisma:PrismaService){}
    
    private async checkLessonOwnership(lessonId: number, user: JwtPayload) {
        if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) return;
        
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: lessonId },
            include: {
                section: { include: { course: { include: { teacher_profile: true } } } },
            },
        });
        if (!lesson) NotFound("Lesson");
        if (lesson.section.course.teacher_profile.userId !== user.id) {
            throw new ForbiddenException("You can only manage homework in your own course");
        }
    }
    
    private async checkSubmissionOwnership(submissionId:number, user:JwtPayload){
        if(user.role !== UserRole.TEACHER && user.role !== UserRole.ASSISTANT){
            if(user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) return
        }
        
        const submission = await this.prisma.homeworkSubmission.findUnique({
            where:{id:submissionId},
            include:{
                homework:{
                    include:{
                        lessons:{
                            include:{
                                section:{
                                    include:{
                                        course:{
                                            include:{
                                                teacher_profile:true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        
        if(!submission) NotFound("Submission");
        
        if(user.role === UserRole.TEACHER){
            if(submission.homework.lessons.section.course.teacher_profile.userId !== user.id){
                throw new ForbiddenException("You can only check submissions in your own course");
            }
        }        
    }
    
    
    async getHomeworkByLesson(lessonId:number){
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) NotFound("Lesson");
        
        const homeworks = await this.prisma.homeworks.findMany({
            where: { lessonsId: lessonId },
            select: {
                id: true,
                title: true,
                created_at: true,
                files:{select:{id:true, file:true}},
            },
            orderBy: { created_at: 'desc' },
        });
        
        return { success: true, data: homeworks };
    }
    
    async getOneHomework(id: number) {
        const homework = await this.prisma.homeworks.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                lessonsId: true,
                created_at: true,
                files:{select:{id:true, file:true}},
            },
        });
        if (!homework) NotFound("Homework");
        
        return { success: true, data: homework };
    }
    
    async createHomework(payload:CreateHomeworkDto ,user: JwtPayload,filenames: string[]) {
        console.log(filenames);
        
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: Number(payload.lessonsId) },
        });
        if (!lesson) NotFound("Lesson");
        
        await this.checkLessonOwnership(Number(payload.lessonsId), user);
        
        
        await this.prisma.homeworks.create({
            data: {
                title: payload.title,
                ...(filenames.length > 0 && {
                    files: {
                        create: filenames.map((file) => ({ file })),
                    },
                }),
                lessons: { connect: { id: Number(payload.lessonsId) } },
            },
        });
        
        return { success: true, message: "Homework created successfully!" };
    }
    
    async updateHomework(id: number,payload: UpdateHomeworkDto,user: JwtPayload,filenames: string[]) {
        const homework = await this.prisma.homeworks.findUnique({
            where: { id },
        });
        if (!homework) NotFound("Homework");
        
        await this.checkLessonOwnership(homework.lessonsId, user);
        
        await this.prisma.homeworks.update({
            where: { id },
            data: {
                ...(payload.title && { title: payload.title }),
                ...(filenames.length > 0 && {
                    files: {
                        create: filenames.map((file) => ({ file })),
                    },
                }),
            },
        });
        
        return { success: true, message: "Homework updated successfully!" };
    }
    
    async deleteHomeworkFile(fileId: number, user: JwtPayload) {
        const file = await this.prisma.homeworkFiles.findUnique({
            where: { id: fileId },
            include: { homework: true },
        });
        if (!file) NotFound("File");
        
        await this.checkLessonOwnership(file.homework.lessonsId, user);
        
        const filePath = join(process.cwd(), 'src', 'uploads', 'files', file.file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        await this.prisma.homeworkFiles.delete({ where: { id: fileId } });
        
        return { success: true, message: "File deleted successfully!" };
    }
    
    async deleteHomework(id: number, user: JwtPayload) {
        const homework = await this.prisma.homeworks.findUnique({
            where: { id },
            include: { files: true },
        });
        if (!homework) NotFound("Homework");
        
        await this.checkLessonOwnership(homework.lessonsId, user);
        
        for (const f of homework.files) {
            const filePath = join(process.cwd(), 'src', 'uploads', 'files', f.file);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        
        await this.prisma.homeworks.delete({ where: { id } });
        
        return { success: true, message: "Homework deleted successfully!" };
    }
    
    
    // Student part start
    
    async submitHomework(homeworkId:number, userId:number, text:string | undefined, filenames:string[]){
        const homework = await this.prisma.homeworks.findUnique({
            where: { id: homeworkId },
        });
        if (!homework) NotFound("Homework");
        
        if ((!text || !text.trim()) && filenames.length === 0) {
            throw new BadRequestException('You must provide text or at least one file');
        }
        
        const lastSubmission = await this.prisma.homeworkSubmission.findFirst({
            where: { homeworkId, userId },
            orderBy: { created_at: 'desc' },
        });
        
        if(lastSubmission){
            if(lastSubmission.status === 'PENDING'){
                throw new ConflictException('Your previous submission is still pending review');
            }
            if (lastSubmission.status === 'APPROVED') {
                throw new ConflictException('This homework is already approved');
            }
        }
        
        await this.prisma.homeworkSubmission.create({
            data: {
                text: text || null,
                homeworkId,
                userId,
                status: 'PENDING',
                ...(filenames.length > 0 && {
                    files: { create: filenames.map((file) => ({ file })) },
                }),
            },
        });
        
        return { success: true, message: "Homework submitted successfully!" };
    }
    
    async getMySubmissions(lessonId:number, userId:number){
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) NotFound("Lesson");
        
        const submissions = await this.prisma.homeworkSubmission.findMany({
            where: {
                userId,
                homework: { lessonsId: lessonId },
            },
            select: {
                id: true,
                text: true,
                reason: true,
                status: true,
                homeworkId: true,
                created_at: true,
                files: { select: { id: true, file: true } },
            },
            orderBy: { created_at: 'desc' },
        });
        
        return {
            success: true,
            data:submissions
        }
    }
    
    
    
    // Teacher part
    
    async getAllSubmissions(user:JwtPayload, courseId:number, status?:HomeworkSubStatus){
        const where:any = {}
        
        if(user.role === UserRole.TEACHER){
            where.homework = {
                lessons:{
                    section: { 
                        course: { 
                            id:courseId,
                            teacher_profile: { userId: user.id }
                        }
                    } 
                }
            }
        }
        
        if(status){
            where.status = status
        }
        
        const submissions = await this.prisma.homeworkSubmission.findMany({
            where,
            select:{
                id:true,
                text: true,
                reason: true,
                status: true,
                created_at: true,
                user:{
                    select:{
                        id:true,
                        full_name:true
                    }
                },
                homework:{
                    select:{
                        id:true,
                        title:true,
                    }
                },
                files:{
                    select:{
                        id:true,
                        file:true
                    }
                }
            },
            orderBy:{created_at: 'desc'}
        })


        return {
            success:true,
            data:submissions
        }
    }
    
    async getSingleSubmission(id:number, user:JwtPayload){
        await this.checkSubmissionOwnership(id, user)
        
        const submission = await this.prisma.homeworkSubmission.findUnique({
            where:{id},
            select:{
                id: true,
                text: true,
                reason: true,
                status: true,
                created_at: true,
                user: { select: { id: true, full_name: true, phone: true } },
                homework: { select: { id: true, title: true } },
                files: { select: { id: true, file: true } },
            }
        })
        
        if (!submission) NotFound("Submission");
        
        return { success: true, data: submission };
    }
    
    async checkSubmission(submissionId:number, user:JwtPayload, status:HomeworkSubStatus, reason?:string){
        if(status !== 'APPROVED' && status !== 'REJECTED'){
            throw new BadRequestException("Status must be APPROVED or REJECTED")
        }
        
        if(status === 'REJECTED' && (!reason || !reason.trim())){
            throw new BadRequestException('Reason is required when rejecting');
        }
        
        await this.checkSubmissionOwnership(submissionId, user)
        
        const target = await this.prisma.homeworkSubmission.findUnique({
            where:{id:submissionId}
        })
        
        if(!target) NotFound("Submission");

        
        if (target.status !== 'PENDING') {
            throw new ConflictException('This submission is already reviewed');
        }
        
        await this.prisma.homeworkSubmission.update({
            where:{id:submissionId},
            data:{
                status,
                reason: status === 'REJECTED' ? reason : null
            }
        })

        return { success: true, message: `Submission ${status.toLowerCase()} successfully!` };
    }
}
