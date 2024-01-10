import { IsObject, IsOptional, IsString } from 'class-validator';
import { ImageEntity } from '../../images/entity/image.entity';

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

  @IsObject()
  img: ImageEntity;
}
