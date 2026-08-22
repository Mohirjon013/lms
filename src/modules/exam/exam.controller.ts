import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/role';
import { CreateTestDto } from './dto/create-test.dto';
import { JwtPayload } from 'src/common/config/jwt';
import { UpdateTestDto } from './dto/update-test.dto';
import { CreateManyTestsDto } from './dto/create-many-test.dto';

@ApiBearerAuth()
@Controller('exam')
export class ExamController {
    constructor(private readonly examService:ExamService){}
    
    // Create Exam endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
    @Post()
    createExam(
        @Body() payload: CreateTestDto,
        @Req() req: Request & { user: JwtPayload }
    ){
        return this.examService.createExam(payload, req.user)
    }
    
    // Create Exam endpoint end
    
    
    // Create many Exam endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
    @ApiBody({
        schema: {
            example: {
                lessonsId: 3,
                tests: [
                    {
                        question: 'JavaScript qaysi yilda yaratilgan?',
                        variantA: '1995',
                        variantB: '2000',
                        variantC: '1989',
                        variantD: '2005',
                        answer: 'variantA',
                    },
                    {
                        question: 'NestJS qaysi tilda yozilgan?',
                        variantA: 'TypeScript',
                        variantB: 'Python',
                        variantC: 'Java',
                        variantD: 'Go',
                        answer: 'variantA',
                    }
                ]
            }
        }
    })
    @Post('many')
    createExamMany(
        @Body() payload: CreateManyTestsDto,
        @Req() req: Request & { user: JwtPayload }
    ){
        return this.examService.createMany(payload, req.user)
    }
    
    // Create many Exam endpoint end
    
    
    // Get all exam start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
    @Get('/all/:lessonId')
    getAllExamsByLesson(
        @Param('lessonId', ParseIntPipe) lessonId: number,
        @Req() req: Request & { user: JwtPayload }
    ){
        return this.examService.getAllExamsByLesson(lessonId, req.user)
    }
    
    // Get all exam end
    
    
    // Delete exam endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
    @Delete(':id')
    DeleteExam(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request & { user: JwtPayload }
    ){
        return this.examService.deleteExam(id, req.user)
    }
    
    // Delete exam endpoint end
    
    
    // Update exam endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT)
    @ApiBody({
        schema: {
            example: {
                question: 'JavaScript qaysi yilda yaratilgan?',
                variantA: '1995',
                variantB: '2000',
                variantC: '1989',
                variantD: '2005',
                answer: 'variantA',
            }
        }
    })
    @Patch(':id')
    UpdateExam(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateTestDto,
        @Req() req: Request & { user: JwtPayload }
    ){
        return this.examService.updateExam(id, payload, req.user)
    }
    
    // Update exam endpoint end
    
}
