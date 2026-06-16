import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../domain/payments/payment.entity';
import { PaymentLog } from '../../domain/payments/payment-log.entity';
import { ChainTransaction } from '../../domain/payments/transaction.entity';
import { Order } from '../../domain/orders/order.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { UniqueAmountService } from './unique-amount.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentLog, ChainTransaction, Order])],
  controllers: [PaymentsController],
  providers: [PaymentsService, UniqueAmountService],
  exports: [PaymentsService, UniqueAmountService]
})
export class PaymentsModule {}
