import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtPayload } from 'src/common/config/jwt';
import { UpdateMaterialDto } from './dto/update-material.dt';


@ApiBearerAuth()
@Controller('materials')
export class MaterialsController {
    constructor(private readonly materialsService : MaterialsService){}
    
    // Get materials by lesson start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT, UserRole.STUDENT)
    @ApiOperation({
        summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}, ${UserRole.STUDENT}`,
    })
    @Get('/lesson/:lessonId')
    getMaterialByLesson(
        @Param('lessonId', ParseIntPipe) lessonId:number
    ){
        return this.materialsService.getMaterialByLesson(lessonId)
    }
    
    // Get materials by lesson end
    
    
    // Get one material start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER, UserRole.ASSISTANT, UserRole.STUDENT)
    @ApiOperation({ summary: 'All roles' })
    @Get(':id')
    getOneMaterial(@Param('id', ParseIntPipe) id: number) {
        return this.materialsService.getOneMaterial(id);
    }
    
    // Get one material end
    
    
    // Delete material file start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}` })
    @Delete('/file/:fileId')
    deleteMaterialFile(
        @Param('fileId', ParseIntPipe) fileId: number,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.materialsService.deleteMaterialFile(fileId, req.user);
    }
    
    // Delete material file end
    
    
    // Delete materials start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER},` })
    @Delete(':id')
    deleteMaterial(
        @Param('id', ParseIntPipe) id:number,
        @Req() req: Request & {user:JwtPayload}
    ){
        return this.materialsService.deleteMaterial(id,req.user)
    }
    
    // Delete materials end
    
    
    // Update material start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}` })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                description: { type: 'string', example: 'Yangilangan izoh' },
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                },
            },
        },
    })
    @Patch(':id')
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
    updateMaterial(
        @Param('id', ParseIntPipe) id: number,
        @Body() payload: UpdateMaterialDto,
        @Req() req: Request & { user: JwtPayload },
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const filenames = files?.map((f) => f.filename) || [];
        return this.materialsService.updateMaterial(id, payload, req.user, filenames);
    }
    
    // Update material end
    
    
    // Create material start
    
    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TEACHER)
    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}, ${UserRole.TEACHER}` })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                lessonsId: { type: 'number', example: 1 },
                description: { type: 'string', example: 'Material izohi' },
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                },
            },
        },
    })
    @Post()
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
    createMaterial(
        @Body() payload: { lessonsId: number; description: string },
        @Req() req: Request & { user: JwtPayload },
        @UploadedFiles() files: Express.Multer.File[],
    ){
        const filenames = files?.map((f) => f.filename) || [];
        return this.materialsService.createMaterial(payload, req.user, filenames);
    }
    
    // Create material end

}
