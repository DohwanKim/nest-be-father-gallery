import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageUrlDto {
  @ApiProperty({
    example: 'id',
    description: '클라우드 플레어 업로드 완료 후 받아온 이미지 ID',
    required: true,
  })
  @IsString()
  id: string;

  @ApiProperty({
    example: 'filename.png',
    description: '업로드한 이미지 파일명',
    required: true,
  })
  @IsString()
  filename: string;

  @ApiProperty({
    example: '{ key: value }',
    description: '업로드한 이미지 Metadata',
    required: true,
  })
  @IsOptional()
  @IsObject()
  metadata: { [key: string]: string };

  @ApiProperty({
    example: '2021-07-28T00:00:00Z',
    description: '업로드한 이미지 생성일',
    required: true,
  })
  @IsTimeZone()
  uploaded: Date;

  @ApiProperty({
    example: true,
    description: '서명된 URL을 요청하는지 여부',
    required: true,
  })
  @IsBoolean()
  requireSignedURLs: boolean;

  @ApiProperty({
    example: ['variant1', 'variant2'],
    description: '이미지 변형 목록',
    required: true,
  })
  @IsString({ each: true })
  variants: string[];
}
