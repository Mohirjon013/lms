import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
// import { Roles } from "../decorators/role";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflactor: Reflector) {}
    
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const role = this.reflactor.get('roles', context.getHandler());
        
        // console.log(role, req.user);
        
        if (!role.includes(req.user.role)) {
            throw new ForbiddenException();
        }
        
        return true;
    }
}
