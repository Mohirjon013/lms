import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/role';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtPayload } from 'src/common/config/jwt';
import { PurchaseDto } from './dto/purchase.dto';

@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService){}
    
    

    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.ADMIN}` })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @Get('/all/payments')
    getAllPayments(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ){
        return this.paymentService.getAllPayments(page,limit)
    }


    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: `${UserRole.SUPERADMIN}, ${UserRole.SUPERADMIN}` })
    @Patch('/confirm/:id')
    confirmPayment(@Param('id', ParseIntPipe) id:number){
        return this.paymentService.confirmPayment(id)
    }


    @UseGuards(AuthGuard, RoleGuard)
    @Roles(UserRole.STUDENT, UserRole.SUPERADMIN)
    @ApiOperation({ summary: `${UserRole.STUDENT}` })
    @Post('purchase')
    purchase(
        @Body() payload: PurchaseDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.paymentService.purchase(payload, req.user.id);
    }
    

    
}
