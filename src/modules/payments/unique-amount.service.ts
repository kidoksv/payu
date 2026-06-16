import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Decimal from 'decimal.js';
import Redis from 'ioredis';
import { REDIS } from '../../infrastructure/redis/redis.module';

@Injectable()
export class UniqueAmountService {
  constructor(@Inject(REDIS) private readonly redis: Redis, private readonly config: ConfigService) {}

  async reserve(baseAmount: string): Promise<string> {
    const address = this.config.get<string>('defaultReceiveAddress');
    const base = new Decimal(baseAmount);
    for (let cents = 1; cents <= 9999; cents += 1) {
      const amount = base.plus(new Decimal(cents).div(100)).toFixed(2);
      const ok = await this.redis.set(`payamt:${address}:${amount}`, '1', 'EX', 1800, 'NX');
      if (ok) return amount;
    }
    throw new ServiceUnavailableException('no unique payment amount available');
  }

  async release(amount: string) {
    const address = this.config.get<string>('defaultReceiveAddress');
    await this.redis.del(`payamt:${address}:${amount}`);
  }
}
