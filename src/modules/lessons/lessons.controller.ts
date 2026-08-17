import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtPayload } from 'src/common/config/jwt';

@ApiBearerAuth()
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonService:LessonsService){}
    
    
    // Get all lessons start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
    })
    @ApiQuery({name:'page', required:false, example:1})
    @ApiQuery({name:'limit', required:false, example:10})
    @Get('/all')
    getAllLesson(
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 10,
        @Req() req: Request & {user:JwtPayload}
        
    ){
        return this.lessonService.getAllLesson(page,limit, req.user)
    }
    
    // Get all lessons end


    // Get lessons by section start

    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
    })
    @Get("/section/:sectionId")
    getLessonBySection(
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 10,
        @Param('sectionId', ParseIntPipe) sectionId : number,
        @Req() req: Request & {user:JwtPayload}

    ){
        return this.lessonService.getLessonBySection(page,limit,sectionId, req.user)
    }

    // Get lessons by section end

    
    
    // Get one lesson start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
    })
    @Get(':id')
    getOneLesson(
        @Param('id', ParseIntPipe) id:number,
        @Req() req: Request & {user:JwtPayload}
    ){
        return this.lessonService.getOneLesson(id, req.user)
    }
    
    // Get one lesson end
    
    
    // Delete lesson start 
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
    })
    @Delete(':id')
    deleteLesson(
        @Param('id', ParseIntPipe) id:number,
        @Req() req: Request & {user:JwtPayload}
    ){
        return this.lessonService.deleteLesson(id, req.user)
    }
    
    // Delete lesson end
    
    
    // Create lesson start 
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example:'React nima?' },
                description: { type: 'string', example:"Bu darsda React haqida bilib olamiz" },
                sectionsId: { type: 'number', example:"1" },
                file: { type: 'string', format: 'binary', description: 'File type (MP4)', },
            },
        },
    })
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage:diskStorage({
                destination:"./src/uploads/videos",
                filename: (req, file, cb) => {
                    const filename =
                    new Date().getTime() + '.' + file.mimetype.split('/')[1];
                    cb(null, filename);
                },
            }),
            limits:{
                fileSize:5 * 1024 * 1024
            },
            fileFilter:(req,file,cb) => {
                if (file.mimetype !== 'video/mp4') {
                    return cb(
                        new BadRequestException('Intro video must be MP4 format'),
                        false,
                    );
                }
                cb(null,true)
            }
        })
    )
    createLesson(
        @Body() payload:CreateLessonDto,
        @Req() req: Request & {user:JwtPayload},
        @UploadedFile() file?:Express.Multer.File
    ){
        return this.lessonService.createLesson(payload, req.user, file?.filename)
    }
    
    // Create lesson end
    
    
    
    // Update lesson start 
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example:'React nima?' },
                description: { type: 'string', example:"Bu darsda React haqida bilib olamiz" },
                sectionsId: { type: 'number', example:"1" },
                file: { type: 'string', format: 'binary', description: 'File type (MP4)', },
            },
        },
    })
    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('file', {
            storage:diskStorage({
                destination:"./src/uploads/videos",
                filename: (req, file, cb) => {
                    const filename =
                    new Date().getTime() + '.' + file.mimetype.split('/')[1];
                    cb(null, filename);
                },
            }),
            limits:{
                fileSize:5 * 1024 * 1024
            },
            fileFilter:(req,file,cb) => {
                if (file.mimetype !== 'video/mp4') {
                    return cb(
                        new BadRequestException('Intro video must be MP4 format'),
                        false,
                    );
                }
                cb(null,true)
            }
        })
    )
    updateLesson(
        @Body() payload:UpdateLessonDto,
        @Param('id', ParseIntPipe) id:number,
        @Req() req: Request & {user:JwtPayload},
        @UploadedFile() file?:Express.Multer.File
    ){
        return this.lessonService.updateLesson(id,payload, req.user, file?.filename)
    }
    
    // Update lesson end
    
}
