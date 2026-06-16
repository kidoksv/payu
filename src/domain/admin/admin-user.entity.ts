import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from './role.entity';

export enum AdminStatus {
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN'
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index({ unique: true })
  @Column({ length: 128 })
  email: string;

  @Column({ name: 'password_hash', length: 128 })
  passwordHash: string;

  @Column({ type: 'enum', enum: AdminStatus, default: AdminStatus.ACTIVE })
  status: AdminStatus;

  @ManyToMany(() => Role, (role) => role.adminUsers, { eager: true })
  @JoinTable({ name: 'admin_user_roles', joinColumn: { name: 'admin_user_id' }, inverseJoinColumn: { name: 'role_id' } })
  roles: Role[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
