import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";


export class PurchaseDto {
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  courseId!: number;
}