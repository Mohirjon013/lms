import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import hashPassword from 'src/common/config/hash';
import { UserRole } from '@prisma/client';
import { JwtPayload } from 'src/common/config/jwt';
import { join } from 'path';
import fs from 'fs'

@Injectable()
export class TeachersService {
  constructor(private prisma : PrismaService){}
  
  async getAllTeacher(page:number,limit:number){
    const skip =  ( page - 1 ) * limit
    const [teachers, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where:{
          role:UserRole.TEACHER
        },
        skip:Number(skip),
        take:Number(limit),
        select: {
          id: true,
          full_name: true,
          phone: true,
          file:true,
          role: true,
          teacherProfiles: {
            select: {
              experience: true,
              job: true,
              website: true,
              facebook: true,
              telegram: true,
              linkedin: true,
              instagram: true,
              github: true,
            }
          }
        }
      }),
      
      this.prisma.user.count({where:{role:UserRole.TEACHER}})
    ])
    
    return {
      success:true,
      total,
      page:Number(page),
      limit:Number(limit),
      data:teachers
    }
  }
  
  async getOneTeacher(id:number){
    const teacher = await this.prisma.user.findFirst({
      where:{id, role:UserRole.TEACHER},
      select:{
        id:true,
        full_name:true,
        phone: true,
        file: true,
        role: true,
        created_at: true,
        teacherProfiles: true
      }
    })
    
    if(!teacher){
      throw new NotFoundException("Teacher not found with this id")
    }
    
    return {
      success:true,
      data:{teacher}
    }
  }
  
  async createTeacher(payload: CreateTeacherDto, filename?:string) {
    const existTeacher = await this.prisma.user.findUnique({
      where:{
        phone:payload.phone
      }
    })
    
    if(existTeacher){
      throw new ConflictException("Teacher already exists with this phone")
    }
    
    await this.prisma.user.create({
      data:{
        full_name:payload.full_name,
        phone:payload.phone,
        password: await hashPassword(payload.password),
        file:filename,
        role:UserRole.TEACHER,
        teacherProfiles:{
          create:{
            experience: Number(payload.experience) ?? null,
            job: payload.job ?? null,
            website: payload.website ?? null,
            description: payload.description ?? null,
            facebook: payload.facebook ?? null,
            telegram: payload.telegram ?? null,
            linkedin: payload.linkedin ?? null,
            instagram: payload.instagram ?? null,
            github: payload.github ?? null
          }
        }
        
      }
    })
    
    
    return {
      success:true,
      message:"Teacher created successfully!"
    }
  }
  
  async updateTeacher(id:number, payload:UpdateTeacherDto, currentUser:JwtPayload, filename?:string){
    const { full_name, phone, password, experience, job, website, description, facebook, telegram, linkedin, instagram, github } = payload;
    
    
    const teacher = await this.prisma.user.findFirst({
      where: { id, role: UserRole.TEACHER }
    })
    
    
    if(!teacher){
      throw new NotFoundException("Admin not found with this id")
    }
    
    if(currentUser.role === UserRole.TEACHER && currentUser.id !== id){
      throw new ForbiddenException("You can only update your own profile")
    }
    
    if(teacher.file && filename){
      const filePath = join(process.cwd(), "src", "uploads", "images", teacher.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    
    await this.prisma.user.update({
      where:{id},
      data:{
        ...(full_name && {full_name}),
        ...(phone && { phone }),
        ...(password && { password: await hashPassword(password) }),
        ...(filename && { file: filename })
      }
    })
    
    await this.prisma.teacherProfile.updateMany({
      where:{userId:id},
      data:{
        ...(job && {job}),
        ...(website && { website }),
        ...(description && { description }),
        ...(facebook && { facebook }),
        ...(telegram && { telegram }),
        ...(linkedin && { linkedin }),
        ...(instagram && { instagram }),
        ...(github && { github }),
        ...(experience && { experience: Number(experience) }),
      }
    })
    
    return {
      success: true,
      message: 'Updated teacher successfully!',
    };
  }
  
  async deleteTeacher(id:number){
    const existTeacher = await this.prisma.user.findUnique({
      where:{id}
    })
    
    if(!existTeacher || existTeacher.role !== UserRole.TEACHER ){
      throw new NotFoundException("Teacher not found with this id")
    }
    
    if(existTeacher.file){
      const filePath = join(process.cwd(), "src", "uploads", "images", `${existTeacher.file}`)
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await this.prisma.user.delete({
      where:{id}
    })
    
    return {
      success:true,
      message: "Teacher deleted successfully!"
    }
  }
}
