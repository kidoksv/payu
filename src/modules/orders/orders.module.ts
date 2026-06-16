import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../domain/products/product.entity';
import { Order } from '../../domain/orders/order.entity';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderNumberService } from './order-number.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product]), PaymentsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderNumberService],
  exports: [OrdersService]
})
export class OrdersModule {}
