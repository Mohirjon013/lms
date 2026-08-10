import { PartialType } from "@nestjs/swagger";
import { CreateSectionDto } from "./create-section.dto";
import { IsOptional, IsString } from "class-validator";


export class UpdateSectionDto extends PartialType(CreateSectionDto){
    @IsString()
    @IsOptional()
    name!: string;
}