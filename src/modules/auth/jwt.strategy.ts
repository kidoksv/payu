import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../domain/users/user.entity';
import { AdminUser, AdminStatus } from '../../domain/admin/admin-user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AdminUser) private readonly admins: Repository<AdminUser>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'change-me'
    });
  }

  async validate(payload: { sub: number; typ: 'user' | 'admin' }) {
    if (payload.typ === 'admin') {
      const admin = await this.admins.findOne({ where: { id: payload.sub } });
      if (!admin || admin.status !== AdminStatus.ACTIVE) throw new UnauthorizedException();
      const permissions = admin.roles?.flatMap((r) => r.permissions?.map((p) => p.code) || []) || [];
      return { id: admin.id, type: 'admin', email: admin.email, permissions };
    }
    const user = await this.users.findOne({ where: { id: payload.sub } });
    if (!user || user.status !== UserStatus.ACTIVE) throw new UnauthorizedException();
    return { id: user.id, type: 'user', email: user.email, permissions: [] };
  }
}
