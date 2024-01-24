import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockService = {
  getMyInfo: jest.fn(),
};

type MockService = Partial<Record<keyof UsersService, jest.Mock>>;

describe('UsersController', () => {
  let controller: UsersController;
  let service: MockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getInfo', () => {
    it('should return a user info', async () => {
      const id = 1;
      const req = {
        user: {
          id,
        },
      };
      const result = {
        id,
        username: 'testman',
        role: 'USER',
      };

      jest.spyOn(service, 'getMyInfo').mockImplementation(() => result);
      expect(controller.getInfo(req)).toEqual(result);
      expect(service.getMyInfo).toHaveBeenCalledWith(id);
    });
  });
});
