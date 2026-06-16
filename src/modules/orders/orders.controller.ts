import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.id, dto);
  }

  @Get(':id')
  detail(@CurrentUser() user: { id: number }, @Param('id') id: string) {
    return this.orders.getForUser(user.id, Number(id));
  }

  @Get(':orderNo/payment-status')
  status(@CurrentUser() user: { id: number }, @Param('orderNo') orderNo: string) {
    return this.orders.getPaymentStatus(user.id, orderNo);
  }
}
