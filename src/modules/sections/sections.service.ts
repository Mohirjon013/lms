import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { NotFound } from 'src/common/config/error';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtPayload } from 'src/common/config/jwt';
import { UserRole } from '@prisma/client';

@Injectable()
export class SectionsService {
    constructor(private prisma:PrismaService){}
    
    
    private async checkCourseOwnership(courseId: number, user: JwtPayload) {
        if (user.role === UserRole.SUPERADMIN || user.role === UserRole.ADMIN) return;
        
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
            include: { teacher_profile: true },
        });
        if (!course) NotFound("Course");
        if (course?.teacher_profile.userId !== user.id) {
            throw new ForbiddenException("You can only manage your own course's sections");
        }
    }
    
    
    async getAllSections(page:number,limit:number,user:JwtPayload ){
        const skip = (page-1) * limit
        
        const where = user.role === UserRole.TEACHER
        ? { course: { teacher_profile: { userId: user.id } } }
        : {};
        
        const [section, total] = await this.prisma.$transaction([
            this.prisma.sections.findMany({
                where,
                skip,
                take:Number(limit),
                select:{
                    id:true,
                    name:true,
                    coursesId:true
                }
            }),
            this.prisma.sections.count({where})
        ])
        
        return {
            success:true,
            total,
            page:Number(page),
            limit:Number(limit),
            data:section
        }
    }
    
    async getSectionByCourse(page:number, limit:number, courseId:number, user: JwtPayload){
        const course  = await this.prisma.courses.findUnique({
            where:{id:courseId}
        })
        if(!course) NotFound("Course");
        
        await this.checkCourseOwnership(courseId, user);
        
        const skip = (page - 1) * limit
        const [sections, total] = await this.prisma.$transaction([
            this.prisma.sections.findMany({
                skip,
                take:Number(limit),
                where:{coursesId:courseId},
                select:{
                    id: true,
                    name: true,
                    coursesId: true,
                }
            }),
            this.prisma.sections.count({
                where:{coursesId:courseId}
            })
        ])
        
        return {
            success:true,
            total,
            page:Number(page),
            limit:Number(limit),
            data:sections
        }
        
    }
    
    async getOneSection(id:number, user:JwtPayload){
        const section = await this.prisma.sections.findUnique({
            where:{id},
            select:{
                id:true,
                name:true,
                coursesId:true
            }
        })
        
        if(!section){
            NotFound("Section")
        }
        
        await this.checkCourseOwnership(section.coursesId, user)
        
        return {
            success:true,
            data:section
        }
    }
    
    async searchSection(name:string, user:JwtPayload){
        if(!name?.trim()) return {success:true, data: []}
        
        const where: any = {
            name: { contains: name.trim(), mode: "insensitive" },
        };
        
        if (user.role === UserRole.TEACHER) {
            where.course = { teacher_profile: { userId: user.id } };
        }
        
        const sections = await this.prisma.sections.findMany({
            where,
            select:{
                id:true,
                name:true,
                coursesId:true
            }
        })
        
        return {
            success:true, 
            data: sections
        }
    }
    
    async deleteSection(id:number, user: JwtPayload){
        const section = await this.prisma.sections.findUnique({
            where:{id}
        })
        
        if(!section) NotFound("Section");
        
        await this.checkCourseOwnership(section?.coursesId as number, user);
        
        await this.prisma.sections.delete({
            where:{id}
        })
        
        return {
            success:true,
            message:"Delete section successfully!"
        }
    }
    
    async createSection(payload:CreateSectionDto, user: JwtPayload){
        const course = await this.prisma.courses.findUnique({
            where:{id:payload.coursesId}
        })
        if(!course) NotFound("Course");
        
        await this.checkCourseOwnership(payload.coursesId, user)
        
        
        const existingName = await this.prisma.sections.findFirst({
            where:{
                coursesId:payload.coursesId,
                name:payload.name
            }
        })
        if(existingName) throw new ConflictException(`Section with name "${payload.name}" already exists in the course`)
            
        
        
        await this.prisma.sections.create({
            data:{
                name:payload.name,
                course:{connect:{id:payload.coursesId}}
            }
        })     
        
        return {
            success:true,
            message:"Created section successfully!"
        }
    }
    
    async updateSection(id:number, payload:UpdateSectionDto, user:JwtPayload){
        const existSection = await this.prisma.sections.findUnique({
            where:{id}
        })
        
        if(!existSection) NotFound("Section");
        
        await this.checkCourseOwnership(existSection?.coursesId as number, user);
        
        if(payload.coursesId){
            const course = await this.prisma.courses.findUnique({
                where:{id:payload.coursesId}
            })
            if(!course) NotFound("Course");
            
            await this.checkCourseOwnership(payload.coursesId, user);
        }
        
        
        if (payload.name || payload.coursesId) {
            const targetName = payload.name ?? existSection?.name;
            const targetCourseId = payload.coursesId ?? existSection?.coursesId;
            
            const duplicate = await this.prisma.sections.findFirst({
                where: {
                    coursesId: targetCourseId,
                    name: targetName,
                    NOT: { id },   // o'zini hisobga olmaslik
                },
            });
            if (duplicate) {
                throw new ConflictException(`Section "${targetName}" already exists in this course`);
            }
        }
        
        
        await this.prisma.sections.update({
            where:{id},
            data:{
                ...(payload.name && { name: payload.name }),
                ...(payload.coursesId && {course:{connect:{id:payload.coursesId} }}),
            }
        })
        
        return {
            success: true,
            message: "Updated section successfully!"
        }
    }
}
