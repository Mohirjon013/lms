import { PartialType } from "@nestjs/swagger";
import { CreateHomeworkDto } from "./create-homework.dto";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";


export class UpdateHomeworkDto extends PartialType(CreateHomeworkDto){
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    lessonsId?:number
    
    @IsString()
    @IsOptional()
    title?: string;
}