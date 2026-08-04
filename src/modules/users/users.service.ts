import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UserRole } from '@prisma/client';
import hashPassword from 'src/common/config/hash';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtPayload } from 'src/common/config/jwt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  async getAllAdmin(page:number, limit:number){
    const skip = (page - 1) * limit
    
    const [admins, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where:{role:UserRole.ADMIN},
        skip:Number(skip),
        take: Number(limit),
        select:{
          id:true,
          full_name:true,
          phone:true,
          role:true,
          created_at:true
        }
      }),
      
      this.prisma.user.count({where:{role:UserRole.ADMIN}})
    ])
    
    return {
      success:true,
      total,
      page:Number(page),
      limit:Number(limit),
      data:admins
    }
  }
  
  async searchAdmin(full_name:string){
    const admins= await this.prisma.user.findMany({
      where:{
        role:UserRole.ADMIN,
        full_name:{
          contains:full_name,
          mode:'insensitive'
        }
      },
      select:{
        id: true,
        full_name: true,
        phone: true,
        role: true,
        created_at: true
      }
    })


    return {
      success:true,
      data:admins
    }
  }
  
  async deleteAdmin(id:number){
    const existAdmin = await this.prisma.user.findUnique({
      where:{id}
    })
    
    
    if(!existAdmin){
      throw new NotFoundException("User not found with this id")
    }
    
    if(existAdmin.role === UserRole.SUPERADMIN){
      throw new ForbiddenException("You cannot delete SUPERADMIN")
    }
    
    await this.prisma.user.delete({
      where:{id}
    })
    
    return {
      success: true,
      message: "Admin deleted successfully!",
    };
  }
  
  async createAdmin(payload: CreateAdminDto, filename?: string) {
    const existAdmin = await this.prisma.user.findUnique({
      where: { phone: payload.phone }
    });
    
    if (existAdmin) {
      throw new ConflictException(
        'Admin already exists with this phone or email',
      );
    }
    
    await this.prisma.user.create({
      data: {
        ...payload,
        role: UserRole.ADMIN,
        password: await hashPassword(payload.password),
        file: filename || null,
      },
    });
    
    return {
      success: true,
      message: 'Admin created successfully!',
    };
  }
  
  async updateAdmin(payload: UpdateAdminDto, id:number, currentUser:JwtPayload){
    const existAdmin = await this.prisma.user.findUnique({
      where:{id}
    })
    
    if(!existAdmin){
      throw new NotFoundException("Admin not found with this id")
    }
    
    if(currentUser.role === UserRole.ADMIN && currentUser.id !== id){
      throw new ForbiddenException("You can only update your own profile")
    }
    
    if(existAdmin.role === UserRole.SUPERADMIN && currentUser.role !== UserRole.SUPERADMIN){
      throw new ForbiddenException("You cannot update SUPERADMIN")
    }
    
    await this.prisma.user.update({
      where:{id:id},
      data:payload
    })
    
    return {
      success: true,
      message: 'Updated admin successfully!',
    };
  }
}
