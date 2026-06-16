import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum WalletMode {
  SINGLE = 'SINGLE',
  ADDRESS_POOL = 'ADDRESS_POOL',
  HD = 'HD'
}

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED'
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'enum', enum: WalletMode, default: WalletMode.SINGLE })
  mode: WalletMode;

  @Index({ unique: true })
  @Column({ length: 64 })
  address: string;

  @Column({ name: 'derivation_path', length: 128, nullable: true })
  derivationPath?: string;

  @Column({ name: 'assigned_order_id', nullable: true })
  assignedOrderId?: number;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
