import { Module } from '@nestjs/common';
import { OrdersModule } from '../modules/orders/orders.module';
import { PaymentsModule } from '../modules/payments/payments.module';
import { TronModule } from '../infrastructure/tron/tron.module';
import { TronListenerJob } from './tron-listener.job';
import { OrderTimeoutJob } from './order-timeout.job';

@Module({
  imports: [OrdersModule, PaymentsModule, TronModule],
  providers: [TronListenerJob, OrderTimeoutJob]
})
export class JobsModule {}
