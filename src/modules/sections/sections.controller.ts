import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionsService } from './sections.service';
import { Roles } from 'src/common/decorators/role';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { getTextOfJSDocComment } from 'typescript';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtPayload } from 'src/common/config/jwt';

@ApiBearerAuth()
@Controller('sections')
export class SectionsController {
    constructor(private readonly sectionService:SectionsService){}
    
    // Get all sections start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiQuery({name:'page', required:false, example:1})
    @ApiQuery({name:'limit', required:false, example:10})
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get('/all')
    getAllSections(
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 10,
        @Req() req:Request & {user:JwtPayload},
        
    ){
        return this.sectionService.getAllSections(page,limit, req.user)
    }
    
    // Get all sections end
    
    
    // Get sections by course start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiQuery({name:'page', required:false, example:1})
    @ApiQuery({name:'limit', required:false, example:10})
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get('/course/:courseId')
    getSectionByCourse(
        @Param('courseId', ParseIntPipe) courseId:number,
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 10,
        @Req() req:Request & {user:JwtPayload}
        
        
    ){
        return this.sectionService.getSectionByCourse(page,limit, courseId, req.user)
    }
    
    // Get sections by course end
    
    
    // Search sections start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get('/search')
    searchSection(
        @Query('name') name:string,
        @Req() req:Request & {user:JwtPayload}
    ){
        return this.sectionService.searchSection(name, req.user)
    }
    
    // Search sections end
    
    
    // Get one sections start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get(':id')
    getOneSection(
        @Param('id', ParseIntPipe) id:number,
        @Req() req:Request & {user:JwtPayload}
    ){
        return this.sectionService.getOneSection(id, req.user)
    }
    
    // Get one sections end
    
    
    // delete section start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @Delete(':id')
    deleteSection(
        @Param('id', ParseIntPipe) id:number, 
        @Req() req:Request & {user:JwtPayload},
    ){
        return this.sectionService.deleteSection(id, req.user)
    }
    
    // delete section end
    
    
    // create section start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Post()
    createSection(
        @Body() payload:CreateSectionDto,
        @Req() req:Request & {user:JwtPayload}
    ){
        return this.sectionService.createSection(payload, req.user)
    }
    
    // create section end
    
    
    // update section start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Patch(':id')
    updateSection(
        @Body() payload:UpdateSectionDto,
        @Req() req:Request & {user:JwtPayload},
        @Param('id' , ParseIntPipe) id:number
    ){
        return this.sectionService.updateSection(id, payload, req.user)
    }
    
    // update section end
    
}
