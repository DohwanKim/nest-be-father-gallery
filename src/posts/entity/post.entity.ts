import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ImageEntity } from '../../images/entity/image.entity';

export enum ArtType {
  'NONE' = 'NONE',
  'WATERCOLOR' = 'WATERCOLOR',
  'PENCIL_DRAWING' = 'PENCIL_DRAWING',
  'ACRYLIC_PAINTING' = 'ACRYLIC_PAINTING',
  'OIL_PAINTING' = 'OIL_PAINTING',
}

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @VersionColumn()
  version: number;

  @Column({ type: 'enum', enum: ArtType, default: ArtType.NONE })
  artType: ArtType;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  size: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar', length: 100 })
  paperType: string;

  @Column({ type: 'varchar' })
  contents: string;

  @Column('simple-array')
  tags: string[];

  @OneToOne(() => ImageEntity, (img) => img.id, { eager: true })
  img: ImageEntity;
}
