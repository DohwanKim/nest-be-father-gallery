import { Controller, Get, UseGuards } from '@nestjs/common';
import { ImagesService } from './images.service';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('/get-upload-url')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        uploadUrl: {
          type: 'string',
          description: '클라우드 플레어 업로드 URL',
          example:
            'https://upload.imagedelivery.net/MXlZJaCYonU_kO5E66JLvw/335c594b-b39e-478b-62c1-739432caa800',
        },
      },
    },
    description: '클라우드 플레어에 이미지를 업로드하기 위한 URL을 반환',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  getUploadUrl() {
    return this.imagesService.getUploadUrl();
  }
}
