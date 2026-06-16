import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 128 })
  code: string;

  @Column({ length: 128 })
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles?: Role[];
}
