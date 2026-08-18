import { HomeworkSubStatus } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";


export class CheckSubmissionDto{
    @Type(() => Number)
    @IsInt()
    submissionId!: number;
    
    @IsEnum(HomeworkSubStatus)
    status!: HomeworkSubStatus;
    
    @IsOptional()
    @IsString()
    reason?: string;
}