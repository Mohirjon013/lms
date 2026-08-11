import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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
}