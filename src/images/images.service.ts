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
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly cloudflareImageBaseUrl =
    'https://api.cloudflare.com/client/v4';

  constructor(private configService: ConfigService) {
    this.accountId = this.configService.get<string>(
      'CLOUDFLARE_IMAGE_ACCOUNT_ID',
    );
    this.apiToken = this.configService.get<string>(
      'CLOUDFLARE_IMAGE_API_TOKEN',
    );
  }

  async getUploadUrl(): Promise<{ uploadUrl: string }> {
    let cloudflareImageResponse: CloudflareImageResponse;

    try {
      cloudflareImageResponse = await axios(
        `${this.cloudflareImageBaseUrl}/accounts/${this.accountId}/images/v2/direct_upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      ).then((res: AxiosResponse<CloudflareImageResponse>) => res.data);
    } catch (error) {
      throw new Error('cloudflare image service is showdown');
    }

    if (!cloudflareImageResponse.success)
      throw new Error('Failed to get upload URL');

    return {
      uploadUrl: cloudflareImageResponse.result.uploadURL,
    };
  }

  async deleteImage(imageId: string): Promise<void> {
    try {
      await axios(
        `${this.cloudflareImageBaseUrl}/accounts/${this.accountId}/images/v1/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );
    } catch (error) {
      throw new Error('Failed to delete image');
    }
  }
}
