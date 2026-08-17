import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { CreateMaterialDto } from "./create-material.dto";


export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  @Type(() => Number)
  @IsOptional()
  lessonsId!: number;

  @IsString()
  @IsOptional()
  description!: string;
}