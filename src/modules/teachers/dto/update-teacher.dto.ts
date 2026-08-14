import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
    @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE })
    @IsOptional()
    @IsEnum(Status)
    status?: Status;
}
