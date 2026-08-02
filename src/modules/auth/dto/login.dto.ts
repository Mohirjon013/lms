import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '+998930002329' })
  @IsMobilePhone()
  phone!: string;
  
  @ApiProperty({ example: 'Olma123!' })
  @IsString()
  password!: string;
}
