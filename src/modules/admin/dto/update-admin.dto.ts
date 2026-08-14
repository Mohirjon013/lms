import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateAdminDto } from "./create-admin.dto";
import { IsEnum, IsOptional } from "class-validator";
import { Status } from "@prisma/client";

export class UpdateAdminDto extends PartialType(CreateAdminDto){
    @ApiPropertyOptional({ enum: Status, example: Status.ACTIVE })
    @IsOptional()
    @IsEnum(Status)
    status?: Status;
} 