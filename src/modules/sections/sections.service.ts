import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { NotFound } from 'src/common/config/error';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
    constructor(private prisma:PrismaService){}
    
    async getAllSections(page:number,limit:number){
        const skip = (page-1) * limit
        const [section, total] = await this.prisma.$transaction([
            this.prisma.sections.findMany({
                skip,
                take:Number(limit),
                select:{
                    id:true,
                    name:true,
                    coursesId:true
                }
            }),
            this.prisma.sections.count()
        ])
        
        return {
            success:true,
            total,
            page:Number(page),
            limit:Number(limit),
            data:section
        }
    }
    
    async getOneSection(id:number){
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
        return {
            success:true,
            data:section
        }
    }
    
    async searchSection(name:string){
        if(!name?.trim()) return {success:true, data: []}
        
        const sections = await this.prisma.sections.findMany({
            where:{
                name:{
                    contains:name.trim(),
                    mode:"insensitive"
                }
            },
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
    
    async deleteSection(id:number){
        const section = await this.prisma.sections.findUnique({
            where:{id}
        })
        
        if(!section) NotFound("Section")
            
        await this.prisma.sections.delete({
            where:{id}
        })
        
        return {
            success:true,
            message:"Delete section successfully!"
        }
    }
    
    async createSection(payload:CreateSectionDto){
        const course = await this.prisma.courses.findUnique({
            where:{id:payload.coursesId}
        })
        if(!course) NotFound("Course")
            
        const existingName = await this.prisma.sections.findUnique({
            where:{name:payload.name}
        })
        if(existingName) throw new ConflictException(`Section with name "${payload.name}" already exists`)
            
        
        
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
    
    async updateSection(id:number, payload:UpdateSectionDto){
        const existSection = await this.prisma.sections.findUnique({
            where:{id}
        })
        
        if(!existSection) NotFound("Section")
            
        if(payload.coursesId){
            const course = await this.prisma.courses.findUnique({
                where:{id:payload.coursesId}
            })
            if(!course) NotFound("Course")
            }
        
        if(payload.name){
            const existingName = await this.prisma.sections.findUnique({
                where:{name:payload.name}
            })
            if(existingName) throw new ConflictException(`Section with name "${payload.name}" already exists`)
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
