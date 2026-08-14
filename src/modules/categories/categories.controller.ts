import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  
  
  // get all categories start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiQuery({name:'page', required:false, example:1})
  @ApiQuery({name:'limit', required:false, example:10})
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
  })
  @Get('/all')
  findAllCategories(
    @Query('page') page:number = 1,
    @Query('limit') limit:number = 1
  ) {
    return this.categoriesService.findAllCategories(page, limit);
  }
  
  // get all categories end
  
  
  // search categories start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
  })
  @Get('/search')
  searchCategories(@Query('name') name:string) {
    return this.categoriesService.searchCategories(name);
  }
  
  // search categories end
  
  
  // get one category start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
  })
  @Get(':id')
  getOneCategories(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getOneCategories(id);
  }
  
  // get one category end
  
  
  // delete categories start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
  })
  @Delete(':id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }
  
  // delete categories end
  
  
  // create categories start
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
  })
  @Post()
  createCategories(@Body() payload: CreateCategoryDto) {
    return this.categoriesService.createCategories(payload);
  }
  
  // create categories end
  
  
  // update categories end
  
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary:`${UserRole.SUPERADMIN}, ${UserRole.ADMIN}`,
  })
  @Patch(':id')
  updateCategory(
    @Param('id', ParseIntPipe) id: number, 
    @Body() payload: UpdateCategoryDto
  ) {
    return this.categoriesService.updateCategory(id, payload);
  }
  
  // update categories end
  
}
