import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ImageEntity } from '../../images/entity/image.entity';
import { ArtType } from '../entity/post.entity';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsEnum(ArtType)
  artType: ArtType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  canvasSize: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  frameType: string;

  @IsString()
  @IsOptional()
  contents: string;

  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @Type(() => ImageEntity)
  @IsOptional()
  img: ImageEntity;
}
