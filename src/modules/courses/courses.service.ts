import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { NotFound } from 'src/common/config/error';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtPayload } from 'src/common/config/jwt';
import { UserRole } from '@prisma/client';
import { join } from 'path';
import fs from "fs"

@Injectable()
export class CoursesService {
    constructor(private prisma:PrismaService){}
    
    
    async getAllCourse(page:number, limit:number, user:JwtPayload){
        const skip = (page-1) * limit
        
        const where = user.role === UserRole.TEACHER
        ? { teacher_profile: { userId: user.id } }
        : {};
        
        const [course, total] = await this.prisma.$transaction([
            this.prisma.courses.findMany({
                where,
                skip,
                take:Number(limit),
                select:{
                    id:true,
                    banner:true,
                    name:true,
                    level:true,
                    price:true,
                    categories:true,
                    teacher_profile:{
                        select:{
                            id:true,
                            user:{
                                select:{
                                    full_name:true,
                                }
                            }
                        }
                    }
                }
            }),
            this.prisma.courses.count({where})
        ])
        
        return {
            success:true,
            total,
            page:Number(page),
            limit:Number(limit),
            data:course
        }
    }
    
    async getOneCourse(id:number){
        const course = await this.prisma.courses.findUnique({
            where:{id},
            select:{
                id:true,
                banner:true,
                intro_video:true,
                name:true,
                level:true,
                price:true,
                description:true,
                categories:{
                    select:{
                        id:true,
                        name:true
                    }
                },
                teacher_profile:{
                    select:{
                        id:true,
                        user:{
                            select:{
                                full_name:true,
                            }
                        }
                    }
                },
                assistant:{
                    select:{
                        id:true,
                        full_name:true
                    }
                }
            }
        })
        
        if(!course){
            NotFound("Course")
        }
        return {
            success:true,
            data:course
        }
        
    }
    
    async searchCourse(name:string, user:JwtPayload){
        if(!name?.trim()) return {success:true, data: []}
        
        const where: any = {
            name: { contains: name.trim(), mode: "insensitive" }
        }
        
        if (user.role === UserRole.TEACHER) {
            where.teacher_profile = { userId: user.id }
        }
        
        const course = await this.prisma.courses.findMany({
            where,
            select:{
                id:true,
                banner:true,
                name:true,
                level:true,
                price:true,
                categories:true
            }
        })
        
        return {
            success:true, 
            data: course
        }
    }
    
    async deleteCourse(id:number){
        const course = await this.prisma.courses.findUnique({
            where:{id}
        })
        
        if(!course) NotFound("Course")
            
        await this.prisma.courses.delete({
            where:{id}
        })
        
        return {
            success:true,
            message:"Delete course successfully!"
        }
    }
    
    async createCourse(payload:CreateCourseDto, user:JwtPayload, files:{ banner?: Express.Multer.File[]; intro_video?: Express.Multer.File[] }){
        let targetTeacherId:number
        
        if(user.role === UserRole.TEACHER){
            targetTeacherId = user.id
        }
        else{
            if(!payload.teacherId){
                throw new BadRequestException('teacherId is required when admin creates a course');
            }
            targetTeacherId = Number(payload.teacherId)
        }
        
        
        
        const teacher = await this.prisma.teacherProfile.findUnique({
            where: { userId: Number(targetTeacherId) },
        });
        
        
        if (!teacher) throw new NotFoundException(`Teacher with id "${targetTeacherId}" not found`);
        
        const category = await this.prisma.categories.findUnique({
            where: { id: payload.categoriesId },
        });
        if (!category) throw new NotFoundException(`Category with id "${payload.categoriesId}" not found`);
        
        
        const existCourse = await this.prisma.courses.findFirst({
            where: {
                name: payload.name,
                categoriesId: Number(payload.categoriesId),
            },
        });
        if (existCourse) {
            throw new ConflictException('A course with this name already exists in this category');
        }
        
        const banner = files?.banner?.[0]?.filename;
        const intro_video = files?.intro_video?.[0]?.filename;
        if (!banner) throw new BadRequestException('Banner is required');
        if (!intro_video) throw new BadRequestException('Intro video is required');
        
        const course = await this.prisma.courses.create({
            data:{
                name:payload.name,
                description:payload.description,
                price:payload.price,
                level:payload.level,
                banner,
                intro_video,
                categories:{connect: {id: payload.categoriesId}},
                teacher_profile:{connect: {id: teacher.id}},
            }
        })
        
        return {
            success:true,
            data:"Create course successfully!"
        }
    }
    
    async updateCourse(payload:UpdateCourseDto, id:number, user:JwtPayload,
        files:{
            banner?:Express.Multer.File[]
            intro_video?:Express.Multer.File[]
        }
    ){
        
        const course = await this.prisma.courses.findUnique({
            where: { id },
            include: { teacher_profile: true }
        });
        if(!course) NotFound("Course")
            
        if(user.role === UserRole.TEACHER){
            if(course?.teacher_profile.userId !== user.id){
                throw new ForbiddenException('You can only update your own course');
            }
        }
        
        if (payload.categoriesId) {
            const category = await this.prisma.categories.findUnique({
                where: { id: Number(payload.categoriesId) },
            });
            if (!category) {
                throw new NotFoundException(`Category with id "${payload.categoriesId}" not found`);
            }
            
        }
        
        if (payload.assistantId) {
            const assistant = await this.prisma.user.findFirst({
                where: { id: Number(payload.assistantId) , role:UserRole.ASSISTANT},
            });
            if (!assistant) {
                throw new NotFoundException(`Assistant with id "${payload.assistantId}" not found`);
            }
        }
        
        if (payload.name || payload.categoriesId) {
            const targetName = payload.name ?? course?.name;
            const targetCategoryId = payload.categoriesId ? Number(payload.categoriesId) : course?.categoriesId;
            
            const existCourse = await this.prisma.courses.findFirst({
                where: {
                    name: targetName,
                    categoriesId: targetCategoryId,
                    NOT: { id },
                },
            });
            if (existCourse) {
                throw new ConflictException('A course with this name already exists in this category');
            }
        }
        
        const banner = files?.banner?.[0]?.filename;
        const intro_video = files?.intro_video?.[0]?.filename;
        
        if (banner && course?.banner) {
            const oldBanner = join(process.cwd(), 'src', 'uploads', 'images', course.banner);
            if (fs.existsSync(oldBanner)) fs.unlinkSync(oldBanner);
        }
        if (intro_video && course?.intro_video) {
            const oldVideo = join(process.cwd(), 'src', 'uploads', 'videos', course.intro_video);
            if (fs.existsSync(oldVideo)) fs.unlinkSync(oldVideo);
        }
        
        const updatedCourse = await this.prisma.courses.update({
            where: { id },
            data: {
                ...(payload.name && { name: payload.name }),
                ...(payload.description && { description: payload.description }),
                ...(payload.price && { price: payload.price }),
                ...(payload.level && { level: payload.level }),
                ...(banner && { banner }),
                ...(intro_video && { intro_video }),
                ...(payload.categoriesId && { categories: { connect: { id: payload.categoriesId } } }),
                ...(payload.assistantId && { assistant: { connect: { id: payload.assistantId } } }),
            }
        });
        
        return {
            success: true,
            message:"Updated course successfully!"
        }
    }
}
