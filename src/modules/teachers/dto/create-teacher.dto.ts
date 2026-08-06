import { Type } from "class-transformer";
import { IsMobilePhone, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator"

export class CreateTeacherDto {
    @IsString()
    @MaxLength(30)
    full_name!:string
    
    @IsString()
    @IsMobilePhone("uz-UZ")
    phone!:string
    
    @IsString()
    @MinLength(4)
    password!:string
    
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    experience?: number;

    @IsString()
    job?: string;

    @IsString()
    website?: string;

    @IsString()
    @MinLength(6)
    description?: string;

    @IsString()
    facebook?: string;

    @IsString()
    telegram?: string;

    @IsString()
    linkedin?: string;

    @IsString()
    instagram?: string;

    @IsString()
    github?: string;
}
