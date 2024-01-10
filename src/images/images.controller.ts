import { Controller, Get } from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('/get-upload-url')
  getUploadUrl() {
    return this.imagesService.getUploadUrl();
  }
}
