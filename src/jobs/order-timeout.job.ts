import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from '../modules/orders/orders.service';

@Injectable()
export class OrderTimeoutJob {
  private readonly logger = new Logger(OrderTimeoutJob.name);

  constructor(private readonly orders: OrdersService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cancelExpiredOrders() {
    try {
      await this.orders.cancelExpired();
    } catch (err) {
      this.logger.error(`cancel expired failed: ${(err as Error).message}`);
    }
  }
}
