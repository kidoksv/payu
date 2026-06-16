import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ name: 'order_id' })
  orderId: number;

  @Index({ unique: true })
  @Column({ length: 128 })
  txid: string;

  @Column({ name: 'from_address', length: 64 })
  fromAddress: string;

  @Column({ name: 'to_address', length: 64 })
  toAddress: string;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  amount: string;

  @Column({ name: 'block_number', nullable: true })
  blockNumber?: number;

  @Column({ default: 0 })
  confirmations: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
