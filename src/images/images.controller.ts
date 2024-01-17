import { Controller, Get, UseGuards } from '@nestjs/common';
import { ImagesService } from './images.service';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('/get-upload-url')
  @UseGuards(JwtAccessGuard)
  getUploadUrl() {
    return this.imagesService.getUploadUrl();
  }
}
