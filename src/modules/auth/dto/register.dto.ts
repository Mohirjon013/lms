import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";


export class RegisterDto {
    @ApiProperty({ example: 'Max Hoffman' })
    @IsString()
    @IsNotEmpty()
    full_name!: string;
    
    @ApiProperty({ example: '+998901234567' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+998\d{9}$/, { message: 'Phone must be in format +998XXXXXXXXX' })
    phone!: string;
    
    @ApiProperty({ example: 1 })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    courseId!: number;
    
    @ApiProperty({ example: '123456' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password!: string;
}