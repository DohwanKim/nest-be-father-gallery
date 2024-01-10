import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

type CloudflareImageResponse = {
  result: {
    id: string;
    uploadURL: string;
  };
  success: boolean;
  errors: [];
  messages: [];
};

@Injectable()
export class ImagesService {
  private accountId: string;
  private apiToken: string;

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>(
      'CLOUDFLARE_IMAGE_ACCOUNT_ID',
    );
    this.apiToken = this.configService.get<string>(
      'CLOUDFLARE_IMAGE_API_TOKEN',
    );
  }

  async getUploadUrl(): Promise<string> {
    const cloudflareImageResponse = await axios(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    )
      .then((e: AxiosResponse<CloudflareImageResponse>) => e.data)
      .catch((e) => {
        throw new Error(e);
      });

    if (!cloudflareImageResponse.success)
      throw new Error('Failed to get upload URL');

    return cloudflareImageResponse.result.uploadURL;
  }
}
