import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsMobilePhone,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty()
  @IsString()
  @MaxLength(30)
  full_name!: string;

  @ApiProperty()
  @IsMobilePhone()
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  password!: string;
}
