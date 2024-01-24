import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const userData: CreateUserDto = {
        username: 'testman123',
        password: 'Testtest1234!',
      };

      usersRepository.create.mockReturnValue(userData);
      usersRepository.save.mockReturnValue(userData);

      const result = await service.createUser(userData);
      expect(result).toEqual(userData);
      expect(usersRepository.create).toHaveBeenCalledWith(userData);
      expect(usersRepository.save).toHaveBeenCalledWith(userData);
    });

    it('should throw ConflictException if user already exists', async () => {
      const userData: CreateUserDto = {
        username: 'testman123',
        password: 'Testtest1234!',
      };

      usersRepository.create.mockReturnValue(userData);
      usersRepository.save.mockRejectedValue({ code: '23505' });

      try {
        await service.createUser(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
      }
    });

    it('should throw InternalServerErrorException', async () => {
      const userData: CreateUserDto = {
        username: 'testman123',
        password: 'Testtest1234!',
      };

      usersRepository.create.mockReturnValue(userData);
      usersRepository.save.mockRejectedValue({ code: '99999' });

      try {
        await service.createUser(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user', async () => {
      const username = 'testman123';
      const result: UserEntity = {
        id: 1,
        createAt: new Date(),
        updateAt: new Date(),
        username: 'testman123',
        password: 'Testtest1234!',
        role: 'ADMIN',
        currentHashedRefreshToken: 'hashedRefreshToken',
      };

      usersRepository.findOne.mockResolvedValue(result);

      const user = await service.findOneByUsername(username);
      expect(user).toEqual(result);
    });

    it('should throw NotFoundException', async () => {
      const username = 'testman123';

      usersRepository.findOne.mockResolvedValue(undefined);
      const result = service.findOneByUsername(username);
      await expect(result).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOneById', () => {
    it('should return a user', async () => {
      const id = 1;
      const result: UserEntity = {
        id,
        createAt: new Date(),
        updateAt: new Date(),
        username: 'testman123',
        password: 'Testtest1234!',
        role: 'ADMIN',
        currentHashedRefreshToken: 'hashedRefreshToken',
      };

      usersRepository.findOne.mockResolvedValue(result);

      const user = await service.findOneById(id);
      expect(user).toEqual(result);
    });

    it('should throw NotFoundException', async () => {
      const id = 1;

      usersRepository.findOne.mockResolvedValue(undefined);
      const result = service.findOneById(id);
      await expect(result).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('setUserCurrentRefreshToken', () => {
    it('should set currentHashedRefreshToken', async () => {
      const refreshToken = 'testRefreshToken';
      const userId = 1;
      const currentHashedRefreshToken = 'hashedRefreshToken';

      (bcrypt.hash as jest.Mock).mockResolvedValue(currentHashedRefreshToken);

      await service.setUserCurrentRefreshToken(refreshToken, userId);
      expect(usersRepository.update).toHaveBeenCalledWith(userId, {
        currentHashedRefreshToken,
      });
    });
  });

  describe('removeRefreshToken', () => {
    it('should remove currentHashedRefreshToken', async () => {
      const userId = 1;

      await service.removeRefreshToken(userId);
      expect(usersRepository.update).toHaveBeenCalledWith(userId, {
        currentHashedRefreshToken: null,
      });
    });
  });

  describe('getUserIfRefreshTokenMatches', () => {
    it('should return a user', async () => {
      const id = 1;
      const refreshToken = 'testRefreshToken';
      const userResult: UserEntity = {
        id,
        createAt: new Date(),
        updateAt: new Date(),
        username: 'testman123',
        password: 'Testtest1234!',
        role: 'ADMIN',
        currentHashedRefreshToken: refreshToken,
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(
        refreshToken === userResult.currentHashedRefreshToken,
      );
      jest.spyOn(service, 'findOneById').mockResolvedValue(userResult);
      const result = await service.getUserIfRefreshTokenMatches(
        refreshToken,
        id,
      );
      expect(result).toEqual(userResult);
    });

    it('should return null', async () => {
      const id = 1;
      const refreshToken = 'testRefreshToken';
      const userResult: UserEntity = {
        id,
        createAt: new Date(),
        updateAt: new Date(),
        username: 'testman123',
        password: 'Testtest1234!',
        role: 'ADMIN',
        currentHashedRefreshToken: 'diffRefreshToken',
      };
      (bcrypt.compare as jest.Mock).mockResolvedValue(
        refreshToken === userResult.currentHashedRefreshToken,
      );

      jest.spyOn(service, 'findOneById').mockResolvedValue(userResult);
      const result = await service.getUserIfRefreshTokenMatches(
        refreshToken,
        id,
      );
      expect(result).toEqual(null);
    });
  });

  describe('getMyInfo', () => {
    it('should return a my info', async () => {
      const id = 1;
      const result: UserEntity = {
        id,
        createAt: new Date(),
        updateAt: new Date(),
        username: 'testman123',
        password: 'Testtest1234!',
        role: 'ADMIN',
        currentHashedRefreshToken: 'diffRefreshToken',
      };

      jest.spyOn(service, 'findOneById').mockResolvedValue(result);
      const myInfo = await service.getMyInfo(id);
      expect(myInfo).toEqual({
        id,
        username: result.username,
        role: result.role,
      });
    });
  });
});
