import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export type UserRoleType = 'ADMIN' | 'MANAGER' | 'USER';

@Entity()
@Unique(['username'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'MANAGER', 'USER'],
    default: 'ADMIN',
  })
  role: UserRoleType;

  @Column({ nullable: true })
  @Exclude()
  currentHashedRefreshToken?: string;
}
