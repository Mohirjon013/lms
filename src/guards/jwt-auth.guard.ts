import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    try {
      let req = context.switchToHttp().getRequest();
      let token = req.headers.authorization;

      if (!token) {
        throw new UnauthorizedException();
      }

      token = token.split(' ')[1];
      const user = this.jwtService.verify(token, {
        secret: process.env.SECRET_KEY,
      });

      req.user = user;
      
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(error);
    }
  }
}
