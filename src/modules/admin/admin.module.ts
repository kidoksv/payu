import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../../domain/admin/admin-user.entity';
import { Role } from '../../domain/admin/role.entity';
import { Permission } from '../../domain/admin/permission.entity';
import { User } from '../../domain/users/user.entity';
import { Product } from '../../domain/products/product.entity';
import { Order } from '../../domain/orders/order.entity';
import { Payment } from '../../domain/payments/payment.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { AdminController } from './admin.controller';
import { AdminSeeder } from './admin.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUser, Role, Permission, User, Product, Order, Payment]), AuthModule, UsersModule, PaymentsModule],
  controllers: [AdminController],
  providers: [AdminSeeder]
})
export class AdminModule {}
