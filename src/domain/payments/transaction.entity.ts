import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('transactions')
export class ChainTransaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index({ unique: true })
  @Column({ length: 128 })
  txid: string;

  @Index()
  @Column({ name: 'to_address', length: 64 })
  toAddress: string;

  @Column({ name: 'from_address', length: 64 })
  fromAddress: string;

  @Column({ type: 'decimal', precision: 20, scale: 6 })
  amount: string;

  @Column({ name: 'block_number', nullable: true })
  blockNumber?: number;

  @Column({ name: 'block_timestamp', type: 'datetime', nullable: true })
  blockTimestamp?: Date;

  @Column({ name: 'raw_json', type: 'json', nullable: true })
  rawJson?: unknown;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
