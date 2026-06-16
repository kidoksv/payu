import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletMode, WalletStatus } from '../../domain/wallets/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(private readonly config: ConfigService, @InjectRepository(Wallet) private readonly wallets: Repository<Wallet>) {}

  async ensureDefaultWallet() {
    const address = this.config.get<string>('defaultReceiveAddress')!;
    const exists = await this.wallets.findOne({ where: { address } });
    if (exists) return exists;
    return this.wallets.save(this.wallets.create({ address, mode: WalletMode.SINGLE, status: WalletStatus.ACTIVE }));
  }

  list() {
    return this.wallets.find({ order: { id: 'DESC' } });
  }
}
