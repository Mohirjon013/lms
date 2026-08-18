import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateHomeworkDto {
    
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty()
    lessonsId!:number
    
    @ApiProperty({ example: 'Homework title' })
    @IsString()
    @IsNotEmpty()
    title!: string;
}