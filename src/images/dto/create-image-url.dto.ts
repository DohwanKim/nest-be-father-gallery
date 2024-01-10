import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
} from 'class-validator';

export class CreateImageUrlDto {
  @IsString()
  id: string;

  @IsString()
  filename: string;

  @IsOptional()
  @IsObject()
  metadata: { [key: string]: string };

  @IsTimeZone()
  uploaded: Date;

  @IsBoolean()
  requireSignedURLs: boolean;

  @IsString({ each: true })
  variants: string[];
}
