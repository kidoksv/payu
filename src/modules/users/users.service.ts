import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../domain/users/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  list() {
    return this.users.find({ order: { id: 'DESC' }, take: 200 });
  }

  async freeze(id: number) {
    return this.setStatus(id, UserStatus.FROZEN);
  }

  async unfreeze(id: number) {
    return this.setStatus(id, UserStatus.ACTIVE);
  }

  private async setStatus(id: number, status: UserStatus) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    user.status = status;
    return this.users.save(user);
  }
}
