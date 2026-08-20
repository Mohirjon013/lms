import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { NotFound } from 'src/common/config/error';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UserRole } from '@prisma/client';
import { JwtPayload } from 'src/common/config/jwt';
import { join } from 'path';
import fs from "fs"

@Injectable()
export class LessonsService {
    constructor(private prisma :PrismaService){}
    
    private async checkSectionOwnership(sectionId: number, user: JwtPayload) {
        if (user.role !== UserRole.TEACHER) return;
        
        const section = await this.prisma.sections.findUnique({
            where: { id: sectionId },
            include: {
                course: {
                    include: { teacher_profile: true },
                },
            },
        });
        if (!section) NotFound("Section");
        if (section?.course.teacher_profile.userId !== user.id) {
            throw new ForbiddenException("You can only manage lessons in your own course");
        }
    }
    
    async getAllLesson(page:number,limit:number, user:JwtPayload){
        const skip = (page - 1) * limit 
        
        const where = user.role === UserRole.TEACHER
        ? { section: { course: { teacher_profile: { userId: user.id } } } }
        : {};
        
        
        const [lesson, total] = await this.prisma.$transaction([
            this.prisma.lessons.findMany({
                where,
                skip, take:Number(limit),
                select:{
                    id:true, 
                    name:true,
                    description:true,
                    file:true,
                    duration:true,
                    sectionsId:true
                }
            }),
            this.prisma.lessons.count({where})
        ])
        
        
        return {
            success:true,
            total,
            page:Number(page),
            limit:Number(limit),
            data:lesson
        }
    }
    
    async getOneLesson(id:number, user:JwtPayload){
        const lesson = await this.prisma.lessons.findUnique({
            where:{id},
            select:{
                id:true, 
                name:true,
                description:true,
                file:true,
                sectionsId:true
            }
        })
        if(!lesson) NotFound("Lesson");
        
        await this.checkSectionOwnership(lesson.sectionsId, user);
        
        return {
            success:true,
            data:lesson
        }
    }
    
    async getLessonBySection(page: number, limit: number, sectionId: number, user: JwtPayload) {
        const section = await this.prisma.sections.findUnique({
            where: { id: sectionId },
        });
        if (!section) NotFound("Section");
        
        await this.checkSectionOwnership(sectionId, user);
        
        const skip = (page - 1) * limit;
        const [lessons, total] = await this.prisma.$transaction([
            this.prisma.lessons.findMany({
                skip,
                take: Number(limit),
                where: { sectionsId: sectionId },
                select: { id: true, name: true, description: true, file: true, sectionsId: true },
            }),
            this.prisma.lessons.count({ where: { sectionsId: sectionId } }),
        ]);
        
        return { success: true, total, page: Number(page), limit: Number(limit), data: lessons };
    }
    
    async deleteLesson(id:number, user: JwtPayload){
        const existLesson = await this.prisma.lessons.findUnique({
            where:{ id }
        })
        if(!existLesson) NotFound("Lesson");
        
        await this.checkSectionOwnership(existLesson.sectionsId , user)
        
        await this.prisma.lessons.delete({
            where:{id}
        })
        
        return{
            success:true,
            message:"Delete lesson successfully!"
        }
    }
    
    async createLesson(payload:CreateLessonDto, user:JwtPayload, filename?:string){
        
        const sectionId = await this.prisma.sections.findUnique({
            where:{
                id:payload.sectionsId
            }
        })
        if(!sectionId) NotFound("Section");
        
        await this.checkSectionOwnership(payload.sectionsId, user);
        
        const existingName = await this.prisma.lessons.findFirst({
            where:{sectionsId:payload.sectionsId ,name:payload.name}
        })
        
        if(existingName) throw new ConflictException(`Lesson with name "${payload.name}" already exists`)
            
        if(!filename) throw new BadRequestException('File is required');
        
        await this.prisma.lessons.create({
            data:{
                name:payload.name,
                description:payload.description,
                file:filename,
                duration:payload.duration ? Number(payload.duration) : null,
                section:{connect:{id:payload.sectionsId}}
            }
        })
        
        return {
            success:true,
            data:"Create lesson successfully!"
        }
    }
    
    async updateLesson(id:number,payload:UpdateLessonDto,user:JwtPayload,filename?:string){
        const existLesson = await this.prisma.lessons.findUnique({
            where:{ id }
        })
        if(!existLesson) NotFound("Lesson");
        
        await this.checkSectionOwnership(existLesson.sectionsId, user);
        
        if(payload.sectionsId){
            const section = await this.prisma.sections.findUnique({
                where:{
                    id:payload.sectionsId
                }
            })
            if (!section) NotFound("Section");
            
            await this.checkSectionOwnership(payload.sectionsId, user);
        }
        
        if (payload.name || payload.sectionsId) {
            const targetName = payload.name ?? existLesson?.name;
            const targetSectionId = payload.sectionsId ?? existLesson?.sectionsId;
            
            const duplicate = await this.prisma.lessons.findFirst({
                where: {
                    sectionsId: targetSectionId,
                    name: targetName,
                    NOT: { id },
                },
            });
            if (duplicate) {
                throw new ConflictException(`Lesson "${targetName}" already exists in this section`);
            }
        }
        
        if (filename && existLesson?.file) {
            const oldFile = join(process.cwd(), 'src', 'uploads', 'videos', existLesson.file);
            if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
        }
        
        await this.prisma.lessons.update({
            where:{ id },
            data:{
                ...(payload.name && { name: payload.name }),
                ...(payload.description && { description: payload.description }),
                ...(filename && { file: filename }),
                ...(payload.duration && { duration: Number(payload.duration) }),
                ...(payload.sectionsId && { section: { connect: { id: payload.sectionsId } } }),
            }
        })
        
        return {
            success: true,
            message: "Updated lesson successfully!"
        }
    }
    
}
