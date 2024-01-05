import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ArtType {
  'WATERCOLOR' = 'WATERCOLOR',
  'PENCIL_DRAWING' = 'PENCIL_DRAWING',
  'ACRYLIC_PAINTING' = 'ACRYLIC_PAINTING',
  'OIL_PAINTING' = 'OIL_PAINTING',
}

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updateAt: Date;

  @Column()
  artType: ArtType;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  paperType: string;

  @Column({ type: 'varchar' })
  contents: string;

  @Column({ type: 'varchar', array: true })
  tags: string[];

  @Column({ type: 'varchar' })
  imgSrc: string;
}
