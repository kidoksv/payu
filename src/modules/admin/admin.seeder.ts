import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AdminUser } from '../../domain/admin/admin-user.entity';
import { Permission } from '../../domain/admin/permission.entity';
import { Role } from '../../domain/admin/role.entity';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(AdminUser) private readonly admins: Repository<AdminUser>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Permission) private readonly permissions: Repository<Permission>
  ) {}

  async onModuleInit() {
    const codes = ['order:read', 'payment:read', 'product:read', 'product:write', 'user:write', 'wallet:read'];
    const permissions = [];
    for (const code of codes) {
      let permission = await this.permissions.findOne({ where: { code } });
      if (!permission) permission = await this.permissions.save(this.permissions.create({ code, name: code }));
      permissions.push(permission);
    }
    let role = await this.roles.findOne({ where: { code: 'SUPER_ADMIN' } });
    if (!role) role = this.roles.create({ code: 'SUPER_ADMIN', name: 'Super Admin', permissions });
    role.permissions = permissions;
    role = await this.roles.save(role);
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (email && password && !(await this.admins.exists({ where: { email } }))) {
      await this.admins.save(this.admins.create({ email, passwordHash: await bcrypt.hash(password, 12), roles: [role] }));
    }
  }
}
