import { ApiProperty } from '@nestjs/swagger';
import { Answer } from '@prisma/client';
import { IsEnum, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateTestDto {

    @ApiProperty({ example: 1 })
    @IsNumber() 
    lessonsId!: number;
    
    @ApiProperty({ example: 'What is NestJS?' })
    @IsString() @MinLength(1)
    question!: string;
    
    @ApiProperty({ example: 'A framework' })
    @IsString() @MinLength(1) 
    variantA!: string;
    
    @ApiProperty({ example: 'A library' })
    @IsString() @MinLength(1) 
    variantB!: string;
    
    @ApiProperty({ example: 'A database' })
    @IsString() @MinLength(1) 
    variantC!: string;

    @ApiProperty({ example: 'A language' })
    @IsString() @MinLength(1) 
    variantD!: string;

    @ApiProperty({ enum: Answer, example: Answer.variantA })
    @IsEnum(Answer) 
    answer!: Answer;
}