import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
    constructor(private readonly courseService:CoursesService){}
    
    
    // get all course start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiQuery({name:'page', required:false, example:1})
    @ApiQuery({name:'limit', required:false, example:10})
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get('/all')
    getAllCourse(
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 1
    ) {
        return this.courseService.getAllCourse(page,limit)
    }
    
    // get all course end
    
    
    // search course start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get('/search')
    searchCourse(@Query('name') name:string){
        return this.courseService.searchCourse(name)
    }
    
    // search course end
    
    
    // get one course start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`
    })
    @Get(':id')
    getOneCourse(@Param('id', ParseIntPipe) id:number){
        return this.courseService.getOneCourse(id)
    }
    
    // get one course end


    // delete course start

    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`
    })
    @Delete(':id')
    deleteCourse(@Param('id', ParseIntPipe) id:number){
        return this.courseService.deleteCourse(id)
    }

    // delete course end
    

    // Update course start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                banner: {
                    type: 'string',
                    format: 'binary',
                    description: 'Banner rasmi (SVG, PNG, JPG, GIF)',
                },
                intro_video: {
                    type: 'string',
                    format: 'binary',
                    description: 'Intro video (mp4)',
                },
                name: {
                    type: 'string',
                    example: 'Frontend dasturlash',
                },
                description: {
                    type: 'string',
                    example: 'Bu kurs haqida ma\'lumot',
                },
                price: {
                    type: 'number',
                    example: 250000,
                },
                level: {
                    type: 'string',
                    enum: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED'],
                    example: 'BEGINNER',
                },
                categoriesId: {
                    type: 'number',
                    example: 1,
                },
                teacherId: {
                    type: 'number',
                    example: 1,
                },
                assistantId: {
                    type: 'number',
                    example: 2,
                    nullable: true,
                },
            },
        },
    })
    @Patch(':id')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                {name:"banner", maxCount:1},
                {name:"intro_video", maxCount:1}
            ],
            {
                storage:diskStorage({
                    destination:(req,file,cb) => {
                        const folder = file.fieldname == "intro_video" ? './src/uploads/videos' : './src/uploads/images'
                        cb(null, folder)
                    },
                    filename:(req,file,cb) => {
                        const filename = new Date().getTime() + '.' + file.mimetype.split('/')[1];
                        cb(null, filename)
                    }
                }),
                fileFilter:(req, file,cb) => {
                    if (file.fieldname === 'banner') {
                        const allowed = ['image/jpeg', 'image/png', 'image/svg+xml'];
                        if (!allowed.includes(file.mimetype)) {
                            return cb(
                                new BadRequestException('Banner must be SVG, PNG, or JPG format'),
                                false, 
                            );
                        }
                    }
                    
                    if (file.fieldname === 'intro_video') {
                        if (file.mimetype !== 'video/mp4') {
                            return cb(
                                new BadRequestException('Intro video must be MP4 format'),
                                false,
                            );
                        }
                    }
                    cb(null, true)
                }
            }
            
        )
    )
    updateCourse(
        @Body() payload:UpdateCourseDto,
        @Param('id', ParseIntPipe) id:number,
        @UploadedFiles() files:{
            banner?:Express.Multer.File[]
            intro_video?:Express.Multer.File[]
        }

    ){
        return this.courseService.updateCourse(payload, id, files)
    }
    
    // Update course end
    
    
    // create course start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                banner: {
                    type: 'string',
                    format: 'binary',
                    description: 'Banner rasmi (SVG, PNG, JPG, GIF)',
                },
                intro_video: {
                    type: 'string',
                    format: 'binary',
                    description: 'Intro video (mp4)',
                },
                name: {
                    type: 'string',
                    example: 'Frontend dasturlash',
                },
                description: {
                    type: 'string',
                    example: 'Bu kurs haqida ma\'lumot',
                },
                price: {
                    type: 'number',
                    example: 250000,
                },
                level: {
                    type: 'string',
                    enum: ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED'],
                    example: 'BEGINNER',
                },
                categoriesId: {
                    type: 'number',
                    example: 1,
                },
                teacherId: {
                    type: 'number',
                    example: 1,
                },
                assistantId: {
                    type: 'number',
                    example: 2,
                    nullable: true,
                },
            },
        },
    })
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                {name:"banner", maxCount:1},
                {name:"intro_video", maxCount:1}
            ],
            {
                storage:diskStorage({
                    destination:(req,file,cb) => {
                        const folder = file.fieldname == "intro_video" ? './src/uploads/videos' : './src/uploads/images'
                        cb(null, folder)
                    },
                    filename:(req,file,cb) => {
                        const filename = new Date().getTime() + '.' + file.mimetype.split('/')[1];
                        cb(null, filename)
                    }
                }),
                fileFilter:(req, file,cb) => {
                    if (file.fieldname === 'banner') {
                        const allowed = ['image/jpeg', 'image/png', 'image/svg+xml'];
                        if (!allowed.includes(file.mimetype)) {
                            return cb(
                                new BadRequestException('Banner must be SVG, PNG, or JPG format'),
                                false, 
                            );
                        }
                    }
                    
                    if (file.fieldname === 'intro_video') {
                        if (file.mimetype !== 'video/mp4') {
                            return cb(
                                new BadRequestException('Intro video must be MP4 format'),
                                false,
                            );
                        }
                    }
                    cb(null, true)
                }
            }
            
        )
    )
    createCourse(
        @Body() payload:CreateCourseDto,
        @UploadedFiles() files:{
            banner?:Express.Multer.File[]
            intro_video?:Express.Multer.File[]
        }
    ){
        return this.courseService.createCourse(payload, files)
    }
    
    // create course end
    
}
