import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtToken } from 'src/common/config/jwt';

@Module({
  providers: [AuthService, JwtToken],
  controllers: [AuthController]
})
export class AuthModule {}
