import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtPayload } from 'src/common/config/jwt';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  

  @ApiOperation({summary:`${UserRole.SUPERADMIN}`})
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiQuery({name:'page', required:false, example:1})
  @ApiQuery({name:'limit', required:false, example:10})

  @Get('admin/all')
  getAllAdmin(
    @Query('page') page:number = 1,
    @Query('limit') limit:number = 10,

  ){
    return this.usersService.getAllAdmin(page,limit)
  }

  @ApiOperation({summary:`${UserRole.SUPERADMIN}`})
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get('admin/search')
  searchAdmin(@Query('full_name') full_name:string){
    return this.usersService.searchAdmin(full_name)
  }

  @ApiOperation({summary:`${UserRole.SUPERADMIN}`})
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @Delete("admin/:id")
  deleteAdmin(@Param('id', ParseIntPipe) id:number){
    return this.usersService.deleteAdmin(id)
  }


  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: `${UserRole.SUPERADMIN}`,
    description:"SUPERADMIN only can add admin"
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
      },
    },
  })
  @Post('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './src/uploads/images',
        filename: (req, file, cb) => {
          const filename =
          new Date().getTime() + '.' + file.mimetype.split('/')[1];
          cb(null, filename);
        },
      }),
    }),
  )
  createAdmin(
    @Body() payload: CreateAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.createAdmin(payload, file?.filename);
  }
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({summary: `${UserRole.SUPERADMIN} ${UserRole.ADMIN}`})
  @Patch("admin/:id")
  updateAdmin(
    @Body() payload:UpdateAdminDto,
    @Param("id", ParseIntPipe) id:number,
    @Req() req:Request & {user:JwtPayload}
  ){
    return this.usersService.updateAdmin(payload, id, req.user)
  }

}
