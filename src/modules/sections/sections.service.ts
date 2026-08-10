import { Body, ConflictException, Injectable, Post } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { NotFound } from 'src/common/config/error';

@Injectable()
export class SectionsService {
    constructor(private prisma:PrismaService){}
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
}
