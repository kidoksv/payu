import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const signature = String(req.headers['x-signature'] || '');
    const timestamp = String(req.headers['x-timestamp'] || '');
    if (!signature || !timestamp) throw new UnauthorizedException('missing signature');
    if (Math.abs(Date.now() - Number(timestamp)) > 5 * 60_000) throw new UnauthorizedException('signature expired');
    const payload = JSON.stringify(req.body || {});
    const expected = createHmac('sha256', this.config.get<string>('signingSecret') || '').update(`${timestamp}.${payload}`).digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('bad signature');
    return true;
  }
}
