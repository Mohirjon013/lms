import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionsService } from './sections.service';
import { Roles } from 'src/common/decorators/role';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { getTextOfJSDocComment } from 'typescript';
import { UpdateSectionDto } from './dto/update-section.dto';

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
        @Query('limit') limit:number = 10
        
    ){
        return this.sectionService.getAllSections(page,limit)
    }
    
    // Get all sections end 
    
    
    // Search sections start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get('/search')
    searchSection(@Query('name') name:string){
        return this.sectionService.searchSection(name)
    }
    
    // Search sections end
    
    
    // Get one sections start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get(':id')
    getOneSection(@Param('id', ParseIntPipe) id:number){
        return this.sectionService.getOneSection(id)
    }
    
    // Get one sections end
    
    
    // delete section start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @Delete(':id')
    deleteSection(@Param('id', ParseIntPipe) id:number){
        return this.sectionService.deleteSection(id)
    }
    
    // delete section end
    
    
    // create section start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Post()
    createSection(@Body() payload:CreateSectionDto){
        return this.sectionService.createSection(payload)
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
        @Param('id' , ParseIntPipe) id:number
    ){
        return this.sectionService.updateSection(id, payload)
    }

    // update section end
    
}
