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
import { AdminsService } from './admins.service';

@ApiBearerAuth()
@Controller('admins')
export class AdminsController {
  constructor(private readonly usersService: AdminsService) {}

  // Get all teacher endpoint start

  @ApiOperation({summary:`${UserRole.SUPERADMIN}`})
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiQuery({name:'page', required:false, example:1})
  @ApiQuery({name:'limit', required:false, example:10})

  @Get('/all')
  getAllAdmin(
    @Query('page') page:number = 1,
    @Query('limit') limit:number = 10,

  ){
    return this.usersService.getAllAdmin(page,limit)
  }

  // Get all teacher endpoint end


  // Search teacher endpoint start

  @ApiOperation({summary:`${UserRole.SUPERADMIN}`})
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @Get('/search')
  searchAdmin(@Query('full_name') full_name:string){
    return this.usersService.searchAdmin(full_name)
  }

  // Search teacher endpoint end


  // Delete teacher endpoint start

  @ApiOperation({summary:`${UserRole.SUPERADMIN}`})
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @Delete("/:id")
  deleteAdmin(@Param('id', ParseIntPipe) id:number){
    return this.usersService.deleteAdmin(id)
  }

  // Delete teacher endpoint end


  // Create teacher endpoint start

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({
    summary: `${UserRole.SUPERADMIN}`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        full_name: { type: 'string' },
        phone: { type: 'string', example:"+998901601122" },
        password: { type: 'string', example:"123456" },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post()
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
  
  // Create teacher endpoint end


  // Update Teacher endpoint start

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({summary: `${UserRole.SUPERADMIN} ${UserRole.ADMIN}`})

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        full_name: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        status:{ type: 'string', enum:['ACTIVE', 'INACTIVE', 'FREEZE']},
        file: { type: 'string', format: 'binary' },
      },
    },
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
  @Patch(":id")
  updateAdmin(
    @Body() payload:UpdateAdminDto,
    @Param("id", ParseIntPipe) id:number,
    @Req() req:Request & {user:JwtPayload},
    @UploadedFile() file?: Express.Multer.File
  ){
    return this.usersService.updateAdmin(payload, id, req.user, file?.filename)
  }

  // Update Teacher endpoint end

}
