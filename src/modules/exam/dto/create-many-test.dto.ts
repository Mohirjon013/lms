import { Type } from 'class-transformer';
import { ArrayMinSize, IsEnum, IsInt, IsString, MinLength, ValidateNested } from 'class-validator';
import { Answer } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

class TestItemDto {
    @ApiProperty({ example: 'JavaScript qaysi yilda yaratilgan?' })
    @IsString()
    question!: string;
    
    @ApiProperty({ example: '1995' })
    @IsString()
    variantA!: string;
    
    @ApiProperty({ example: '2000' })
    @IsString()
    variantB!: string;
    
    @ApiProperty({ example: '1989' })
    @IsString()
    variantC!: string;
    
    @ApiProperty({ example: '2005' })
    @IsString()
    variantD!: string;
    
    @ApiProperty({ enum: Answer, example: Answer.variantA })
    @IsEnum(Answer) 
    answer!: Answer;
}

export class CreateManyTestsDto {
    @ApiProperty({ example: 3 })
    @IsInt() 
    lessonsId!: number;
    
    @ValidateNested({ each: true })
    @Type(() => TestItemDto)
    @ArrayMinSize(1)
    tests!: TestItemDto[];
}