import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { Product } from '../../domain/products/product.entity';
import { Order } from '../../domain/orders/order.entity';
import { Payment } from '../../domain/payments/payment.entity';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
    private readonly payments: PaymentsService,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Product) private readonly products: Repository<Product>
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.adminLogin(dto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('order:read')
  @Get('orders')
  listOrders() {
    return this.orders.find({ order: { id: 'DESC' }, take: 200 });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:read')
  @Get('payments')
  listPayments() {
    return this.paymentRepo.find({ order: { id: 'DESC' }, take: 200 });
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('payment:read')
  @Get('payment-logs')
  logs() {
    return this.payments.listLogs();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user:write')
  @Get('users')
  listUsers() {
    return this.users.list();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user:write')
  @Patch('users/:id/freeze')
  freeze(@Param('id') id: string) {
    return this.users.freeze(Number(id));
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('user:write')
  @Patch('users/:id/unfreeze')
  unfreeze(@Param('id') id: string) {
    return this.users.unfreeze(Number(id));
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('product:read')
  @Get('products')
  listProducts() {
    return this.products.find({ order: { id: 'DESC' }, take: 200 });
  }
}
