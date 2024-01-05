import { IsOptional, IsString } from 'class-validator';

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

  @IsString()
  imgSrc: string;
}
