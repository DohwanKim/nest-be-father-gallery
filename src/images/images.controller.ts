import { Controller, Get, UseGuards } from '@nestjs/common';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('/get-upload-url')
  @UseGuards(JwtAuthGuard)
  getUploadUrl() {
    return this.imagesService.getUploadUrl();
  }
}
