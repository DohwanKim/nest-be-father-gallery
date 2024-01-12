import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

// export enum UserRole {
//   'ADMIN',
//   'MANAGER',
//   'USER',
// }

@Entity()
@Unique(['username'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;
}
