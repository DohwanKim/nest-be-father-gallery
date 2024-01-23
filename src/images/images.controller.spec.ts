import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

const mockService = {
  getUploadUrl: jest.fn(),
};

describe('ImagesController', () => {
  let controller: ImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [{ provide: ImagesService, useValue: mockService }],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUploadUrl', () => {
    it('should return an array', async () => {
      const expectResult = 'https://test.com';

      jest
        .spyOn(mockService, 'getUploadUrl')
        .mockImplementation(() => expectResult);

      expect(await controller.getUploadUrl()).toEqual(expectResult);
    });
  });
});
