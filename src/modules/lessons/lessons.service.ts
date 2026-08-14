import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { NotFound } from 'src/common/config/error';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
    constructor(private prisma :PrismaService){}

    async getAllLesson(page:number,limit:number){
        const skip = (page - 1) * limit 
        const [lesson, total] = await this.prisma.$transaction([
            this.prisma.lessons.findMany({
                skip, take:Number(limit),
                select:{
                    id:true, 
                    name:true,
                    description:true,
                    file:true,
                    sectionsId:true
                }
            }),
            this.prisma.lessons.count()
        ])
        
        
        return {
            success:true,
            total,
            page:Number(page),
            limit:Number(limit),
            data:lesson
        }
    }
    
    async getOneLesson(id:number){
        const existLesson = await this.prisma.lessons.findUnique({
            where:{ id }
        })
        if(!existLesson) NotFound("Lesson") 
            
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
        
        
        return {
            success:true,
            data:lesson
        }
    }
    
    async deleteLesson(id:number){
        const existLesson = await this.prisma.lessons.findUnique({
            where:{ id }
        })
        if(!existLesson) NotFound("Lesson");
        
        await this.prisma.lessons.delete({
            where:{id}
        })

        return{
            success:true,
            message:"Delete lesson successfully!"
        }
    }

    async createLesson(payload:CreateLessonDto, filename?:string){
        const sectionId = await this.prisma.sections.findUnique({
            where:{
                id:payload.sectionsId
            }
        })
        
        if(!sectionId) NotFound("Section")
            
        // const existingName = await this.prisma.lessons.findUnique({
        //     where:{name:payload.name}
        // })
        
        // if(existingName) throw new ConflictException(`Lesson with name "${payload.name}" already exists`)
            
        if(!filename) throw new BadRequestException('File is required');
        
        await this.prisma.lessons.create({
            data:{
                name:payload.name,
                description:payload.description,
                file:filename as string,
                section:{connect:{id:payload.sectionsId}}
            }
        })
        
        return {
            success:true,
            data:"Create lesson successfully!"
        }
    }
    
    async updateLesson(id:number,payload:UpdateLessonDto,filename?:string){
        const existLesson = await this.prisma.lessons.findUnique({
            where:{ id }
        })
        if(!existLesson) NotFound("Lesson")
            
        if(payload.sectionsId){
            const section = await this.prisma.sections.findUnique({
                where:{ id: payload.sectionsId }
            })
            if(!section) NotFound("Section")
            }
        
        // if(payload.name){
        //     const existingName = await this.prisma.lessons.findUnique({
        //         where:{ name: payload.name }
        //     })
        //     if(existingName) throw new ConflictException(`Lesson with name "${payload.name}" already exists`);
        // }
        
        await this.prisma.lessons.update({
            where:{ id },
            data:{
                ...(payload.name && { name: payload.name }),
                ...(payload.description && { description: payload.description }),
                ...(filename && { file: filename }),
                ...(payload.sectionsId && { section: { connect: { id: payload.sectionsId } } }),
            }
        })
        
        return {
            success: true,
            message: "Updated lesson successfully!"
        }
    }

}
