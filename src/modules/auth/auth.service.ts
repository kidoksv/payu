import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { User } from '../../domain/users/user.entity';
import { AdminUser, AdminStatus } from '../../domain/admin/admin-user.entity';
import { REDIS } from '../../infrastructure/redis/redis.module';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AdminUser) private readonly admins: Repository<AdminUser>,
    @Inject(REDIS) private readonly redis: Redis
  ) {}

  async createRegisterChallenge() {
    const left = Math.floor(Math.random() * 8) + 2;
    const right = Math.floor(Math.random() * 8) + 2;
    const challengeId = randomUUID();
    await this.redis.set(`auth:register-challenge:${challengeId}`, String(left + right), 'EX', 300);
    return { challengeId, question: `${left} + ${right} = ?`, expiresIn: 300 };
  }

  async register(dto: RegisterDto) {
    await this.verifyRegisterChallenge(dto.challengeId, dto.challengeAnswer);
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();
    const emailExists = await this.users.exists({ where: { email } });
    if (emailExists) throw new ConflictException('该邮箱已经注册，请直接登录');
    const usernameExists = await this.users.exists({ where: { username } });
    if (usernameExists) throw new ConflictException('该用户名已经被占用，请换一个');
    const user = this.users.create({ email, username, passwordHash: await bcrypt.hash(dto.password, 12) });
    await this.users.save(user);
    return this.issueToken(user.id, 'user', { email: user.email, username: user.username });
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.users.findOne({ where: [{ email: identifier }, { username: identifier }] });
    if (!user) throw new UnauthorizedException('账号不存在，请检查邮箱或用户名');
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('密码错误，请重新输入');
    user.lastLoginAt = new Date();
    await this.users.save(user);
    return this.issueToken(user.id, 'user', { email: user.email, username: user.username });
  }

  async adminLogin(dto: LoginDto) {
    const admin = await this.admins.findOne({ where: { email: dto.identifier.trim().toLowerCase() } });
    if (!admin || admin.status !== AdminStatus.ACTIVE || !(await bcrypt.compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException('管理员账号或密码错误');
    }
    return this.issueToken(admin.id, 'admin', { email: admin.email });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.oldPassword, user.passwordHash))) throw new UnauthorizedException('bad credentials');
    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.users.save(user);
    return { success: true };
  }

  private async verifyRegisterChallenge(challengeId: string, answer: string) {
    const key = `auth:register-challenge:${challengeId}`;
    const expected = await this.redis.get(key);
    await this.redis.del(key);
    if (!expected) throw new BadRequestException('验证已过期，请刷新后重试');
    if (expected !== answer.trim()) throw new BadRequestException('验证答案不正确');
  }

  private issueToken(sub: number, typ: 'user' | 'admin', profile?: Record<string, unknown>) {
    return { accessToken: this.jwt.sign({ sub, typ }), tokenType: 'Bearer', user: profile };
  }
}
