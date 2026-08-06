import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query, ParseIntPipe, Req } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtPayload } from 'src/common/config/jwt';

@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}
  
  
  // Get all teacher endpoint start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiQuery({name:'page', required:false, example:1})
  @ApiQuery({name:'limit', required:false, example:10})
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
  })
  @Get('/all')
  getAllTeacher(
    @Query('page') page:number = 1,
    @Query('limit') limit:number = 10
  ) {
    return this.teachersService.getAllTeacher(page,limit);
  }
  
  // Get all teacher endpoint end
  
  
  // Get one teacher endpoint start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN} ${UserRole.ADMIN}`
  })
  @Get(':id')
  getOneTeacher(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.getOneTeacher(id);
  }
  
  // Get one teacher endpoint end
  
  
  // Delete teacher endpoint start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN} ${UserRole.ADMIN}`
  })
  @Delete(':id')
  deleteTeacher(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.deleteTeacher(id);
  }
  
  // Delete teacher endpoint end
  
  
  // Create teacher endpoint start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN} ${UserRole.ADMIN}`,
    description:"BU endpoint"
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: "object",
      required: ['full_name', 'phone', 'password'],
      properties: {
        full_name: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        file: { type: 'string', format: 'binary' },
        experience: { type: 'number', example: 3 },
        job: { type: 'string', example: 'UI/UX Designer' },
        website: { type: 'string', example: 'https://example.com' },
        facebook: { type: 'string', example: 'https://facebook.com/username' },
        telegram: { type: 'string', example: 'https://t.me/username' },
        linkedin: { type: 'string', example: 'https://linkedin.com/in/username' },
        instagram: { type: 'string', example: 'https://instagram.com/username' },
        github: { type: 'string', example: 'https://github.com/username' },
      }
    }
  })
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage:diskStorage({
        destination:"./src/uploads/images",
        filename: (req,file,cb) => {
          const filename = new Date().getTime() + '.' + file.mimetype.split('/')[1];
          
          cb(null, filename)
        }
      })
    })
  )
  createTeacher(
    @Body() payload: CreateTeacherDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.teachersService.createTeacher(payload, file?.filename);
  }
  
  // Create teacher endpoint end
  
  
  // Update teacher endpoint start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN},${UserRole.TEACHER}`,
    description:"BU endpoint"
  })

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        full_name: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        file: { type: 'string', format: 'binary' },
        experience: { type: 'number' },
        job: { type: 'string' },
        website: { type: 'string' },
        description: { type: 'string' },
        facebook: { type: 'string' },
        telegram: { type: 'string' },
        linkedin: { type: 'string' },
        instagram: { type: 'string' },
        github: { type: 'string' },
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination:"./src/uploads/images",
        filename: (req,file,cb) => {
          const filename =new Date().getTime() + '.' + file.mimetype.split('/')[1];
          cb(null, filename);
        }
      })
    })
  )
  @Patch(':id')
  updateTeacher(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateTeacherDto: UpdateTeacherDto,
    @Req() req:Request & {user:JwtPayload},
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.teachersService.updateTeacher(id, updateTeacherDto, req.user, file?.filename);
  }
  
  // Update teacher endpoint end
  
}
