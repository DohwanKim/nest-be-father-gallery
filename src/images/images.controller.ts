import { Controller, Get } from '@nestjs/common';

@Controller('images')
export class ImagesController {
  @Get()
  getUploadUrl() {
    return 'This will return the URL where we can upload our image';
  }
}
