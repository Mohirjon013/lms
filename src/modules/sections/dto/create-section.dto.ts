import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateSectionDto{
    @ApiProperty({ example: "React asoslari" })
    @IsString()
    @IsNotEmpty()
    name!: string;
    
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsNumber()
    coursesId!: number;
}