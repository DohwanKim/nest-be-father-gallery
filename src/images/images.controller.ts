import { Controller, Get, UseGuards } from '@nestjs/common';
import { ImagesService } from './images.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('/get-upload-url')
  @UseGuards(AuthGuard('jwt'))
  getUploadUrl() {
    return this.imagesService.getUploadUrl();
  }
}
