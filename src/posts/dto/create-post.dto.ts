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
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: '제목',
    description: '작품 제목',
    required: true,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 'NONE',
    description: '그림 타입 종류',
    required: true,
  })
  @IsOptional()
  @IsEnum(ArtType)
  artType: ArtType;

  @ApiProperty({
    example: '캔버스 사이즈',
    description: '작가 이름',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  canvasSize: string;

  @ApiProperty({
    example: 100000,
    description: '작품 가격',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price: number;

  @ApiProperty({
    example: '액자 종류',
    description: '액자 종류',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  frameType: string;

  @ApiProperty({
    example: '작품 세부 설명',
    description: '작품 설명',
    required: false,
  })
  @IsString()
  @IsOptional()
  contents: string;

  @ApiProperty({
    example: ['태그1', '태그2'],
    description: '태그 목록',
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @ApiProperty({
    example: 'null | Cloudflare URL Object',
    description: '이미지 URL',
    required: false,
  })
  @Type(() => ImageEntity)
  @IsOptional()
  img: ImageEntity;
}
