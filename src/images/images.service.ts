import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as process from 'process';

@Injectable()
export class ImagesService {
  constructor(private readonly httpService: HttpService) {}

  async getUploadUrl() {
    const uploadUrl = this.httpService.post(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ID}/images/v2/direct_upload`,
    );

    console.log(uploadUrl);

    return 'This will return the URL where we can upload our image';
  }
}
