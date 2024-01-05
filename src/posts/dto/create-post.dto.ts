import { IsOptional, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  paperType: string;

  @IsOptional()
  @IsString()
  contents: string;

  @IsOptional()
  @IsString({ each: true })
  tags: string[];

  @Column({ type: 'varchar' })
  imgSrc: string;
}
