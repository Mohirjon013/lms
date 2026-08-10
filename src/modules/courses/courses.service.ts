import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { triggerAsyncId } from 'async_hooks';
import { NotFound } from 'src/common/config/error';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
    constructor(private prisma:PrismaService){}
    
    
    async getAllCourse(page:number, limit:number){
        const skip = (page-1) * limit
        const [course, total] = await this.prisma.$transaction([
            this.prisma.courses.findMany({
                skip,
                take:Number(limit),
                select:{
                    id:true,
                    banner:true,
                    name:true,
                    level:true,
                    price:true,
                    categories:true
                }
            }),
            this.prisma.courses.count()
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
                user:true
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
    
    async searchCourse(name:string){
        if(!name?.trim()) return {success:true, data: []}
        
        const course = await this.prisma.courses.findMany({
            where:{
                name:{
                    contains:name.trim(),
                    mode:"insensitive"
                }
            },
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
    
    async createCourse(payload:CreateCourseDto, files:{ banner?: Express.Multer.File[]; intro_video?: Express.Multer.File[] }){
        const teacher = await this.prisma.teacherProfile.findUnique({
            where: { id: Number(payload.teacherId) },
        });
        if (!teacher) throw new NotFoundException(`Teacher with id "${payload.teacherId}" not found`);
        
        const category = await this.prisma.categories.findUnique({
            where: { id: payload.categoriesId },
        });
        if (!category) throw new NotFoundException(`Category with id "${payload.categoriesId}" not found`);
        
        if (payload.assistantId) {
            const assistant = await this.prisma.user.findUnique({
                where: { id: payload.assistantId },
            });
            if (!assistant) throw new NotFoundException(`Assistant with id "${payload.assistantId}" not found`);
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
                teacher_profile:{connect: {id: Number(payload.teacherId)}},
                ...(payload.assistantId && {user: {connect: {id: payload.assistantId}}})
            }
        })
        
        return {
            success:true,
            data:course
        }
    }
    
    async updateCourse(payload:UpdateCourseDto, id:number, 
        files:{
            banner?:Express.Multer.File[]
            intro_video?:Express.Multer.File[]
        }
    ){
        const course = await this.prisma.courses.findUnique({
            where: { id }
        });
        if(!course) NotFound("Course")
            
        if (payload.teacherId) {
            const teacher = await this.prisma.teacherProfile.findUnique({
                where: { id:payload.teacherId }
            });
            if (!teacher) throw new NotFoundException(`Teacher with id "${payload.teacherId}" not found`);
        }
        
        if (payload.categoriesId) {
            const category = await this.prisma.categories.findUnique({
                where: { id: payload.categoriesId }
            });
            if (!category) throw new NotFoundException(`Category with id "${payload.categoriesId}" not found`);
        }
        
        if (payload.assistantId) {
            const assistant = await this.prisma.user.findUnique({
                where: { id: payload.assistantId }
            });
            if (!assistant) throw new NotFoundException(`Assistant with id "${payload.assistantId}" not found`);
        }
        
        const banner = files?.banner?.[0]?.filename;
        const intro_video = files?.intro_video?.[0]?.filename;
        
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
                ...(payload.teacherId && { teacher_profile: { connect: { id: payload.teacherId } } }),
                ...(payload.assistantId && { user: { connect: { id: payload.assistantId } } }),
            }
        });
        
        return {
            success: true,
            message:"Updated course successfully!"
        }
    }
}
