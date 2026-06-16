import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentLogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

@Entity('payment_logs')
export class PaymentLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @Column({ name: 'order_id', nullable: true })
  orderId?: number;

  @Index()
  @Column({ length: 128, nullable: true })
  txid?: string;

  @Column({ type: 'enum', enum: PaymentLogLevel, default: PaymentLogLevel.INFO })
  level: PaymentLogLevel;

  @Column({ length: 64 })
  event: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  context?: unknown;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
