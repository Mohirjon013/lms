import { PartialType } from "@nestjs/swagger";
import { CreateCourseDto } from "./create-course.dto";
import { IsEnum, IsOptional } from "class-validator";
import { CourseLevel } from "@prisma/client";

export class UpdateCourseDto extends PartialType(CreateCourseDto){
    @IsOptional()
    @IsEnum(CourseLevel)
    level?: CourseLevel
}