import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from '../../posts/entity/post.entity';
import { IsOptional } from 'class-validator';

@Entity()
export class ImageEntity {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column()
  id: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  metadata: { [key: string]: string };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploaded: Date;

  @Column()
  requireSignedURLs: boolean;

  @Column({ type: 'varchar', array: true })
  variants: string[];

  @OneToOne(() => PostEntity, (postEntity) => postEntity.id, {
    onDelete: 'CASCADE',
  })
  post: PostEntity;
}
