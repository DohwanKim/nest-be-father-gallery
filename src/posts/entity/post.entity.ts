import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

  @Column({ type: 'varchar', length: 100, comment: '게시글 제목' })
  title: string;

  @Column({
    type: 'enum',
    enum: ArtType,
    nullable: true,
    comment: '그등림의 종류(수채화, 연필화 등등)',
  })
  artType: ArtType;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '그림을 그린 캔버스의 사이즈를 적어준다.',
  })
  canvasSize: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: '가격이 들어간다. 필요 없을 수도 있지만 우선 만들어 둔다.',
  })
  price: number;

  @Column({ type: 'boolean', default: false, comment: '판매 여부' })
  isSold: boolean;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '액자의 타입을 적어준다.',
  })
  frameType: string;

  @Column({ type: 'varchar', nullable: true, comment: '본문 내용이 들어간다.' })
  contents: string;

  @Column({
    type: 'varchar',
    array: true,
    nullable: true,
    comment: '일단 만들어 두었다. 태그들을 배치한다.',
  })
  tags: string[];

  @OneToOne(() => ImageEntity, (image) => image.uid, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  img: ImageEntity;
}
