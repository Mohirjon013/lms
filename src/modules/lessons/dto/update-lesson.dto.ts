import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateLessonDto } from "./create-lesson.dto";
import { IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";


export class UpdateLessonDto extends PartialType(CreateLessonDto){
    @IsString()
    @IsOptional()
    name!: string;
    
    @ApiPropertyOptional({ example: 10, description: 'Dars davomiyligi — DAQIQADA (masalan 90 = 1 soat 30 daqiqa)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    duration?: number;
}