import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, PayloadTooLargeException, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { HomeworkService } from './homework.service';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { HomeworkSubStatus, UserRole } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtPayload } from 'src/common/config/jwt';
import { UpdateHomeworkDto } from './dto/update-homework.dto';
import { CheckSubmissionDto } from './dto/check-submision.dto';

@ApiBearerAuth()
@Controller('homework')
export class HomeworkController {
    constructor(private readonly homeworkService : HomeworkService){}
    
    
    // Get homework by lesson start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT, UserRole.STUDENT)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}, ${UserRole.STUDENT}`,
        description: 'Returns all homeworks for a specific lesson. Accessible by all roles.',   
    })
    @Get('/lesson/:lessonId')
    getHomeworkByLesson(
        @Param('lessonId', ParseIntPipe) lessonId:number,
        @Req() req: Request & { user: JwtPayload },
    ){
        return this.homeworkService.getHomeworkByLesson(lessonId, req.user)
    }
    
    // Get materials by lesson end
    
    
    // Get one homework start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT, UserRole.STUDENT)
    @ApiOperation({ 
        summary: 'All roles',
        description: 'Returns a single homework by its ID. Accessible by all roles.', 
    })
    @Get('/detail/:id')
    getOneHomework(@Param('id', ParseIntPipe) id: number) {
        return this.homeworkService.getOneHomework(id);
    }
    
    // Get one homework end
    
    
    // Delete homework file start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ 
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
        description: 'Deletes a specific file attached to a homework. Only SUPERADMIN, ADMIN, and TEACHER can perform this action.',
    })
    @Delete('/file/:fileId')
    deleteHomeworkFile(
        @Param('fileId', ParseIntPipe) fileId: number,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.homeworkService.deleteHomeworkFile(fileId, req.user);
    }
    
    // Delete homework file end
    
    
    // Delete homework start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ 
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER},`,
        description: 'Permanently deletes a homework by ID. Only SUPERADMIN, ADMIN, and TEACHER can perform this action.'
    })
    @Delete(':id')
    deleteHomework(
        @Param('id', ParseIntPipe) id:number,
        @Req() req: Request & {user:JwtPayload}
    ){
        return this.homeworkService.deleteHomework(id,req.user)
    }
    
    // Delete homework end
    
    
    // Create homework start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ 
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
        description: 'Creates a new homework with optional file attachments (max 10 files). Only SUPERADMIN, ADMIN, and TEACHER can perform this action.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                lessonsId: { type: 'number', example: 1 },
                title: { type: 'string', example: 'Uyga vazifa' },
                files: {
                    type:'array',
                    items:{type:"string", format:"binary"}
                }
            },
        },
    })
    @Post('/create')
    @UseInterceptors(
        FilesInterceptor('files',10, {
            storage: diskStorage({
                destination: './src/uploads/files',
                filename: (req, file, cb) => {
                    const filename = new Date().getTime() + '-' + Math.round(Math.random() * 1e6) + '.' + file.mimetype.split('/')[1];
                    cb(null, filename);
                },
            }),
        }),
    )
    createHomework(
        @Body() payload: { lessonsId: number; title: string },
        @Req() req: Request & { user: JwtPayload },
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const filenames = files?.map(item => item.filename) || []
        return this.homeworkService.createHomework(payload, req.user, filenames);
    }
    
    // Create homework end
    
    
    // Update homework start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ 
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}`,
        description: 'Updates an existing homework by ID. New files can be attached (max 10 files). Only SUPERADMIN, ADMIN, and TEACHER can perform this action.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Uyga vazifa' },
                files: {
                    type:'array',
                    items:{type:"string", format:"binary"}
                }
            },
        },
    })
    @Patch(':id')
    @UseInterceptors(
        FilesInterceptor('files',10, {
            storage: diskStorage({
                destination: './src/uploads/files',
                filename: (req, file, cb) => {
                    const filename = new Date().getTime() + '-' + Math.round(Math.random() * 1e6) + '.' + file.mimetype.split('/')[1];
                    cb(null, filename);
                },
            }),
        }),
    )
    updateHomework(
        @Param('id', ParseIntPipe) id:number,
        @Body() payload:UpdateHomeworkDto,
        @Req() req: Request & { user: JwtPayload },
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const filenames = files?.map(item => item.filename) || []
        return this.homeworkService.updateHomework(id,payload, req.user, filenames);
    }
    
    // Update homework end
    
    
    
    // Submit homework start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    @ApiOperation({ 
        summary: `${UserRole.STUDENT}`,
        description: 'Student submits a homework with optional text and file attachments (max 10 files). Only STUDENT can perform this action.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                text: { type: 'string', example: 'Vazifani bajardim' },
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
            },
        },
    })
    @Post('/submit/:homeworkId')
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: './src/uploads/files',
                filename: (req, file, cb) => {
                    const filename = new Date().getTime() + '-' + Math.round(Math.random() * 1e6) + '.' + file.mimetype.split('/')[1];
                    cb(null, filename);
                },
            }),
        }),
    )
    submitHomework(
        @Param('homeworkId', ParseIntPipe) homeworkId: number,
        @Body() payload: { text?: string },
        @Req() req: Request & { user: JwtPayload },
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const filenames = files?.map((f) => f.filename) || [];
        return this.homeworkService.submitHomework(homeworkId, req.user.id, payload.text, filenames);
    }
    
    // Submit homework end
    
    
    // Get my submissions start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT, UserRole.SUPERADMIN)
    @ApiOperation({ 
        summary: `${UserRole.STUDENT}`,
        description: 'Returns all homework submissions made by the authenticated student for a specific lesson.'
    })
    @Get('/submission/mine/:lessonId')
    getMySubmissions(
        @Param('lessonId', ParseIntPipe) lessonId: number,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.homeworkService.getMySubmissions(lessonId, req.user.id);
    }
    
    // Get my submissions end
    
    
    // Get all Submissions start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.TEACHER, UserRole.ASSISTANT)
    @ApiOperation({ 
        summary: `${UserRole.TEACHER}, ${UserRole.ASSISTANT}`,
        description: 'Returns all homework submissions for a specific course. Can be filtered by status (query param). Only TEACHER and ASSISTANT can perform this action.'
    })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: HomeworkSubStatus,
    })
    @Get('/all/:courseId/homework/submission')
    getAllSubmissions(
        @Req() req: Request & {user: JwtPayload},
        @Param('courseId', ParseIntPipe) courseId: number,
        @Query('status') status?: HomeworkSubStatus,
    ){
        return this.homeworkService.getAllSubmissions(req.user, courseId, status)
    }
    
    // Get all Submissions end
    
    
    
    // Get single submissions start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.TEACHER, UserRole.ASSISTANT)
    @ApiOperation({ 
        summary: `${UserRole.TEACHER}, ${UserRole.ASSISTANT}`,
        description: 'Returns a single homework submission by ID. Only TEACHER and ASSISTANT can perform this action.'
    })
    @Get('/submission/single/:id')
    getSingleSubmission(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request & { user: JwtPayload },
    ){
        return this.homeworkService.getSingleSubmission(id, req.user);
    }
    
    // Get single submissions end
    
    
    // Check submission start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.TEACHER, UserRole.ASSISTANT)
    @ApiOperation({ 
        summary: `${UserRole.TEACHER}, ${UserRole.ASSISTANT}`,
        description: 'Teacher or assistant reviews a homework submission — sets status and optionally provides a reason/feedback. Only TEACHER and ASSISTANT can perform this action.'
    })
    @Post('/submision/check')
    checkSubmission(
        @Body() payload:CheckSubmissionDto,
        @Req() req: Request & { user: JwtPayload },
    ){
        return this.homeworkService.checkSubmission(payload.submissionId,req.user, payload.status, payload.reason)
    }
    
}
