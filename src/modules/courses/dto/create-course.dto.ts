import { CourseLevel } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDto {
    
    @IsString()
    name!:string
    
    @IsString()
    description!: string;
    
    @Type(() => Number)
    @IsNumber()
    price!: number
    
    @IsEnum(CourseLevel)
    level!:CourseLevel
    
    
    @Type(() => Number)
    @IsNumber()
    categoriesId!: number;
    
    @Type(() => Number)
    @IsNumber()
    teacherId!: number;
    
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    assistantId?: number;
}