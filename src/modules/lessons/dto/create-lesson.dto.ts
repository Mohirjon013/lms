import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLessonDto{
    @ApiProperty({ example: "React nima?" })
    @IsString()
    @IsNotEmpty()
    name!: string;
    
    @ApiProperty({ example: "Bu darsda React haqida bilib olamiz" })
    @IsString()
    description!: string;
    
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsNumber()
    sectionsId!: number;
    
    @ApiPropertyOptional({ example: 10, description: 'Dars davomiyligi — DAQIQADA (masalan 90 = 1 soat 30 daqiqa)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    duration?: number;
}