import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateMaterialDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNotEmpty()
  lessonsId!: number;

  @ApiProperty({ example: 'Material izohi' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}