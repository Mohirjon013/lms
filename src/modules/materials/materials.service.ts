import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { NotFound } from 'src/common/config/error';
import { JwtPayload } from 'src/common/config/jwt';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import fs from 'fs'
import { join } from 'path';
import { UpdateMaterialDto } from './dto/update-material.dt';

@Injectable()
export class MaterialsService {
    constructor(private prisma:PrismaService){}
    
    
    private async checkLessonOwnership(lessonId:number, user:JwtPayload){
        if(user.role == UserRole.SUPERADMIN || user.role == UserRole.ADMIN) return
        
        const lesson = await this.prisma.lessons.findUnique({
            where:{id: lessonId},
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
        })
        
        if (!lesson) NotFound("Lesson");
        if (lesson.section.course.teacher_profile.userId !== user.id) {
            throw new ForbiddenException("You can only manage materials in your own course");
        }
    }
    
    async getMaterialByLesson(lessonId:number){
        
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: lessonId },
        });
        if (!lesson) NotFound("Lesson");
        
        const materials = await this.prisma.materials.findMany({
            where:{lessonsId:lessonId},
            select: {
                id: true,
                description: true,
                created_at: true,
                files: {
                    select: { id: true, file: true },
                },
            },
            orderBy: { created_at: 'desc' },
        })
        
        return { 
            success: true, 
            data: materials
        };
    }
    
    async getOneMaterial(id:number){
        const material = await this.prisma.materials.findUnique({
            where: { id },
            select: {
                id: true,
                description: true,
                lessonsId: true,
                created_at: true,
                files: { select: { id: true, file: true } },
            },
        });
        if (!material) NotFound("Material");
        
        return { success: true, data: material };
    }
    
    async deleteMaterial(id:number, user:JwtPayload){
        const material = await this.prisma.materials.findUnique({
            where: { id },
            include: { files: true },
        });
        if (!material) NotFound("Material");
        
        await this.checkLessonOwnership(material.lessonsId, user);
        
        for (const f of material.files) {
            const filePath = join(process.cwd(), 'src', 'uploads', 'files', f.file);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        
        await this.prisma.materials.delete({ where: { id } });
        
        return { success: true, message: "Material deleted successfully!" };
    }
    
    async createMaterial(payload:CreateMaterialDto ,user: JwtPayload,filenames: string[]) {
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: Number(payload.lessonsId) },
        });
        if (!lesson) NotFound("Lesson");
        
        await this.checkLessonOwnership(Number(payload.lessonsId), user);
        
        if (!filenames || filenames.length === 0) {
            throw new BadRequestException('At least one file is required');
        }
        
        await this.prisma.materials.create({
            data: {
                description: payload.description,
                lessons: { connect: { id: Number(payload.lessonsId) } },
                files: {
                    create: filenames.map((file) => ({ file })),
                },
            },
        });
        
        return { success: true, message: "Material created successfully!" };
    }
    
    async updateMaterial(id:number, payload:UpdateMaterialDto, user:JwtPayload, filenames:string[] ){
        const material = await this.prisma.materials.findUnique({
            where: { id },
        });
        if (!material) NotFound("Material");
        
        await this.checkLessonOwnership(material.lessonsId, user);
        
        await this.prisma.materials.update({
            where: { id },
            data: {
                ...(payload.description && { description: payload.description }),
                ...(filenames.length > 0 && {
                    files: {
                        create: filenames.map((file) => ({ file })),
                    },
                }),
            },
        });
        
        return { success: true, message: "Material updated successfully!" };
    }
    
    async deleteMaterialFile(fileId: number, user: JwtPayload) {
        const file = await this.prisma.materialFiles.findUnique({
            where: { id: fileId },
            include: { materials: true },
        });
        if (!file) NotFound("File");
        
        await this.checkLessonOwnership(file.materials.lessonsId, user);
        
        const filePath = join(process.cwd(), 'src', 'uploads', 'files', file.file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        await this.prisma.materialFiles.delete({ where: { id: fileId } });
        
        return { success: true, message: "File deleted successfully!" };
    }
}
