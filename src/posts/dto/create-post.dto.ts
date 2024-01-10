import { IsObject, IsOptional, IsString } from 'class-validator';
import { ImageEntity } from '../../images/entitiy/image.entitiy';

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
