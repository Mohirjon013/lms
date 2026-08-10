import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionsService } from './sections.service';
import { Roles } from 'src/common/decorators/role';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/jwt-auth.guard';

@ApiBearerAuth()
@Controller('sections')
export class SectionsController {
    constructor(private readonly sectionService:SectionsService){}
    
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`
    })
    @Post()
    createSection(@Body() payload:CreateSectionDto){
        return this.sectionService.createSection(payload)
    }
}
