import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updateAt: Date;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  paperType: string;

  @Column({ type: 'varchar' })
  contents: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', array: true })
  tags: string[];

  @Column({ type: 'varchar' })
  imgSrc: string;
}
