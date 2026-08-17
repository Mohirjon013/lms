import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateCourseDto } from "./create-course.dto";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { CourseLevel } from "@prisma/client";
import { Type } from "class-transformer";

export class UpdateCourseDto extends PartialType(CreateCourseDto){
    @ApiPropertyOptional({ example: 'Frontend dasturlash' })
    @IsOptional()
    @IsString()
    name?: string;
    
    @ApiPropertyOptional({ example: 'Bu kurs haqida...' })
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiPropertyOptional({ example: 250000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    price?: number;
    
    @ApiPropertyOptional({ enum: CourseLevel })
    @IsOptional()
    @IsEnum(CourseLevel)
    level?: CourseLevel;
    
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    categoriesId?: number;
    
    @ApiPropertyOptional({ example: 5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    assistantId?: number;
}