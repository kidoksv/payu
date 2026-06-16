import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import { REDIS } from '../infrastructure/redis/redis.module';
import { TronService } from '../infrastructure/tron/tron.service';
import { PaymentsService } from '../modules/payments/payments.service';
import { OrdersService } from '../modules/orders/orders.service';

@Injectable()
export class TronListenerJob {
  private readonly logger = new Logger(TronListenerJob.name);

  constructor(
    private readonly config: ConfigService,
    private readonly tron: TronService,
    private readonly payments: PaymentsService,
    private readonly orders: OrdersService,
    @Inject(REDIS) private readonly redis: Redis
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async pollUsdtTransfers() {
    const lock = await this.redis.set('lock:tron-listener', '1', 'EX', 8, 'NX');
    if (!lock) return;
    try {
      const defaultAddress = this.config.get<string>('defaultReceiveAddress')!;
      const addresses = await this.orders.getActivePayAddresses(defaultAddress);
      for (const address of addresses) {
        const cursorKey = `tron:cursor:${address}`;
        const lastTs = Number((await this.redis.get(cursorKey)) || Date.now() - 24 * 60 * 60_000);
        const transfers = await this.tron.getUsdtTransfers(address, Math.max(0, lastTs - 120_000));
        let maxTs = lastTs;
        for (const transfer of transfers.sort((a, b) => (a.blockTimestamp?.getTime() || 0) - (b.blockTimestamp?.getTime() || 0))) {
          await this.payments.handleTransfer(transfer);
          if (transfer.blockTimestamp) maxTs = Math.max(maxTs, transfer.blockTimestamp.getTime());
        }
        await this.redis.set(cursorKey, String(maxTs));
      }
    } catch (err) {
      this.logger.error(`poll failed: ${(err as Error).message}`, (err as Error).stack);
    }
  }
}
