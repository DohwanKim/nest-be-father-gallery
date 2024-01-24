import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const CLOUDFLARE_IMAGE_ACCOUNT_ID = 'dummy_account_id';
const CLOUDFLARE_IMAGE_API_TOKEN = 'dummy_api_token';

describe('ImagesService', () => {
  let service: ImagesService;
  let configService: ConfigService;
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'CLOUDFLARE_IMAGE_ACCOUNT_ID') {
                return CLOUDFLARE_IMAGE_ACCOUNT_ID;
              } else if (key === 'CLOUDFLARE_IMAGE_API_TOKEN') {
                return CLOUDFLARE_IMAGE_API_TOKEN;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    configService = module.get(ConfigService);
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUploadUrl', () => {
    it('should get upload URL from Cloudflare Image service', async () => {
      const accountId = configService.get('CLOUDFLARE_IMAGE_ACCOUNT_ID');
      const expectedUploadUrl = 'https://cloudflare.com/upload';

      mockAxios
        .onPost(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
        )
        .reply(200, {
          success: true,
          result: {
            id: 'image_id',
            uploadURL: expectedUploadUrl,
          },
        });

      const uploadUrl = await service.getUploadUrl();

      expect(uploadUrl).toEqual(expectedUploadUrl);
    });

    it('should handle failure to get upload URL from Cloudflare Image is showdown', async () => {
      const accountId = configService.get('CLOUDFLARE_IMAGE_ACCOUNT_ID');

      mockAxios
        .onPost(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
        )
        .reply(500, {
          success: false,
          errors: ['cloudflare image service is showdown'],
        });

      await expect(service.getUploadUrl()).rejects.toThrow(
        new Error('cloudflare image service is showdown'),
      );
    });

    it('should handle failure to get upload URL from Cloudflare Image service', async () => {
      const accountId = configService.get('CLOUDFLARE_IMAGE_ACCOUNT_ID');

      mockAxios
        .onPost(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
        )
        .reply(200, {
          success: false,
        });

      await expect(service.getUploadUrl()).rejects.toThrow(
        'Failed to get upload URL',
      );
    });
  });
});
