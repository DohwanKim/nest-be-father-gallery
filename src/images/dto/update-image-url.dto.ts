import { PartialType } from '@nestjs/mapped-types';
import { CreateImageUrlDto } from './create-image-url.dto';

export class UpdateImageUrlDto extends PartialType(CreateImageUrlDto) {}
