import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../domain/users/user.entity';
import { AdminUser, AdminStatus } from '../../domain/admin/admin-user.entity';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AdminUser) private readonly admins: Repository<AdminUser>
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.exists({ where: { email: dto.email } });
    if (exists) throw new ConflictException('email already registered');
    const user = this.users.create({ email: dto.email, passwordHash: await bcrypt.hash(dto.password, 12) });
    await this.users.save(user);
    return this.issueToken(user.id, 'user');
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('bad credentials');
    user.lastLoginAt = new Date();
    await this.users.save(user);
    return this.issueToken(user.id, 'user');
  }

  async adminLogin(dto: LoginDto) {
    const admin = await this.admins.findOne({ where: { email: dto.email } });
    if (!admin || admin.status !== AdminStatus.ACTIVE || !(await bcrypt.compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException('bad credentials');
    }
    return this.issueToken(admin.id, 'admin');
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.oldPassword, user.passwordHash))) throw new UnauthorizedException('bad credentials');
    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.users.save(user);
    return { success: true };
  }

  private issueToken(sub: number, typ: 'user' | 'admin') {
    return { accessToken: this.jwt.sign({ sub, typ }), tokenType: 'Bearer' };
  }
}
