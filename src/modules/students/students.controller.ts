import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtPayload } from 'src/common/config/jwt';

@ApiBearerAuth()
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService :StudentsService){}
    
    
    
    // Get All students endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiQuery({name:'page', required:false, example:1})
    @ApiQuery({name:'limit', required:false, example:10})
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
    })
    @Get('/all')
    getAllStudents(
        @Query('page') page:number = 1,
        @Query('limit') limit:number = 10
        
    ){
        return this.studentsService.getAllStudents(page,limit)
    }
    
    // Get All students endpoint end
    
    
    // Search students endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
    })
    @Get('/search')
    searchStudent(@Query('name') name:string){
        return this.studentsService.searchStudent(name)
    }
    
    // Search students endpoint end
    
    
    // My courses start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    @ApiOperation({
        summary:`${UserRole.STUDENT}`
    })
    @Get("my-courses")
    getMyCourses(@Req() req: Request & { user: JwtPayload }){
        return this.studentsService.getMyCourses(req.user.id)
    }
    
    // My courses end
    
    
    // Get course content title start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: `${UserRole.STUDENT}` })
    @Get('/course/:courseId/content')
    getCourseContent(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.studentsService.getCourseContent(courseId, req.user.id);
    }
    
    // Get course content title end
    
    
    // get lesson-video start 
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: `${UserRole.STUDENT}` })
    @Get('/lesson/:lessonId/video')
    getLessonForStudent(
        @Param('lessonId', ParseIntPipe) lessonId: number,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.studentsService.getLessonForStudent(lessonId, req.user.id);
    }
    
    // get lesson-video end
    
    
    // Post rating to lesson start

    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT)
    @ApiOperation({ summary: `${UserRole.STUDENT}` })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { rate: { type: 'number', example: 5 } },
        },
    })
    @Post('/lesson/:lessonId/rate')
    rateLesson(
        @Param('lessonId', ParseIntPipe) lessonId: number,
        @Body() payload: { rate: number },
        @Req() req: Request & { user: JwtPayload },
    ){
        return this.studentsService.rateLesson(lessonId, payload.rate, req.user.id)
    }
    
    // Post rating to lesson end
    
    
    // Get lesson rating start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'All roles' })
    @Get('/lesson/:lessonId/rating')
    getLessonRating(@Param('lessonId', ParseIntPipe) lessonId: number) {
        return this.studentsService.getLessonRating(lessonId);
    }
    
    // Get lesson rating end

    
    // Get one students endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
    })
    @Get('/:id')
    getOneStudent(@Param('id', ParseIntPipe) id:number){
        return this.studentsService.getOneStudent(id)
    }
    
    // Get one students endpoint end
    
    
    // Delete student endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN} ${UserRole.ADMIN}`
    })
    @Delete(':id')
    deleteStudent(@Param('id', ParseIntPipe) id: number) {
        return this.studentsService.deleteStudent(id);
    }
    
    // Delete student endpoint end
    
    
    // Update student endpoint start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({
        summary:`${UserRole.SUPERADMIN} ${UserRole.ADMIN}`
    })
    @Patch(':id')
    updateStudent(
        @Param('id', ParseIntPipe) id: number, 
        @Body() payload: UpdateStudentDto,
    ) {
        return this.studentsService.updateStudent(id,payload);
    }
    
    // Update student endpoint end
    
    
    
}
