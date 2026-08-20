import { ApiOperation, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { HomeworkSubStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";


export class CheckSubmissionDto{
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsInt()
    submissionId!: number;
    
    @ApiProperty({ enum: HomeworkSubStatus, example: HomeworkSubStatus.APPROVED })
    @IsEnum(HomeworkSubStatus)
    status!: HomeworkSubStatus;
    
    @ApiPropertyOptional({ example: 'Homework is incomplete' })
    @IsOptional()
    @IsString()
    reason?: string;
}