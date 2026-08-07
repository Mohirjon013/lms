import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService){}
  
  
  async findAllCategories(page:number, limit:number){
    const skip = (page - 1) * limit
    const [categories, total] = await this.prisma.$transaction([
      this.prisma.categories.findMany({
        skip,
        take:Number(limit),
      }),
      this.prisma.categories.count()
    ])
    return {
      success:true,
      total,
      page:Number(page),
      limit:Number(limit),
      data:categories
    }
  }
  
  async searchCategories(name:string){
    if(!name?.trim()){
      return {success:true, data:[]}
    }
    const categories = await this.prisma.categories.findMany({
      where:{
        name:{
          contains:name.trim(),
          mode:'insensitive'
        }
      }
    })
    
    return {
      success:true,
      data:categories
    }
  }
  
  async getOneCategories(id:number){
    const categories = await this.prisma.categories.findUnique({
      where:{id}
    })
    
    if(!categories){
      throw new NotFoundException("Category not found with this id")
    }
    
    return {
      success:true,
      data:categories
    }
  }

  async createCategories(payload:CreateCategoryDto){
    const existCategories = await this.prisma.categories.findUnique({
      where:{name:payload.name}
    })
    
    if(existCategories){
      throw new ConflictException('Category already exists')
    }
    
    await this.prisma.categories.create({
      data: { name: payload.name }
    })
    
    return {
      success: true,
      message: 'Category created successfully!'
    }
  }
  
  async updateCategory(id:number, payload:UpdateCategoryDto){
    const categories = await this.prisma.categories.findUnique({
      where:{id}
    })
    
    if(!categories){
      throw new NotFoundException("Category not found with this id")
    }
    
    await this.prisma.categories.update({
      where:{id},
      data:{
        ...payload
      }
    })
    
    return {
      success: true,
      message:"Category updated successfully!"
    };
  }
  
  async deleteCategory(id:number){
    const categories = await this.prisma.categories.findUnique({
      where:{id}
    })
    
    if(!categories){
      throw new NotFoundException("Category not found with this id")
    }

    await this.prisma.categories.delete({
      where:{id}
    })

    return{
      success:true,
      message:"Delete category successfully!"
    }
  }
}
