import { PartialType } from '@nestjs/swagger';
import { CreateImageUrlDto } from './create-image-url.dto';

export class UpdateImageUrlDto extends PartialType(CreateImageUrlDto) {}
