import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from '../../infrastructure/redis/redis.module';

@Injectable()
export class OrderNumberService {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async next(): Promise<string> {
    const d = new Date();
    const day = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
    const seq = await this.redis.incr(`order:seq:${day}`);
    await this.redis.expire(`order:seq:${day}`, 172800);
    return `ORD${day}${String(seq).padStart(6, '0')}`;
  }
}
