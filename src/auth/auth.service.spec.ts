import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../users/entity/user.entity';

jest.mock('bcrypt');

const mockUsersService = {
  findOneByUsername: jest.fn(),
  findOneById: jest.fn(),
  createUser: jest.fn(),
  setUserCurrentRefreshToken: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_ACCESS_TOKEN_SECRET') {
      return 'test';
    } else if (key === 'JWT_ACCESS_TOKEN_EXPIRATION_TIME') {
      return '3600s';
    } else if (key === 'JWT_REFRESH_TOKEN_SECRET') {
      return 'test';
    } else if (key === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME') {
      return '3600s';
    } else if (key === 'DOMAIN') {
      return 'localhost';
    }
    return null;
  }),
};

type MockService<T> = Partial<Record<keyof T, jest.Mock>>;

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: MockService<UsersService>;
  let jwtService: MockService<JwtService>;
  let configService: MockService<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a user', async () => {
      const salt = 'salt';
      const hashedPassword = 'hashedPassword';
      const signUpDto = {
        username: 'test',
        password: hashedPassword,
      };

      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await authService.signUp(signUpDto);
      expect(usersService.createUser).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should return a token', async () => {
      const id = 1;
      const accessTokenData = {
        accessToken: 'accessToken',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      };
      const refreshTokenData = {
        refreshToken: 'refreshToken',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      };
      const signInDto = {
        username: 'testtesttest',
        password: 'Testtest!',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest
        .spyOn(authService, 'getCookieWithJwtAccessToken')
        .mockReturnValue(accessTokenData);
      jest
        .spyOn(authService, 'getCookieWithJwtRefreshToken')
        .mockReturnValue(refreshTokenData);
      usersService.findOneByUsername.mockReturnValue({
        id,
        ...signInDto,
      });

      expect(await authService.signIn(signInDto)).toEqual({
        accessTokenData,
        refreshTokenData,
      });

      const mockUser = usersService.findOneByUsername(signInDto.username);
      expect(usersService.findOneByUsername).toHaveBeenCalledWith(
        signInDto.username,
      );
      expect(authService.getCookieWithJwtAccessToken).toHaveBeenCalledWith(
        mockUser,
      );
      expect(authService.getCookieWithJwtRefreshToken).toHaveBeenCalledWith(
        mockUser,
      );
      expect(usersService.setUserCurrentRefreshToken).toHaveBeenCalledWith(
        refreshTokenData.refreshToken,
        id,
      );
    });

    it('should throw an error if user is not found', async () => {
      const signInDto = {
        username: 'testtesttest',
        password: 'Testtest!',
      };

      usersService.findOneByUsername.mockReturnValue(null);
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('invalid password'),
      );
    });

    it('should throw an error if password is wrong', async () => {
      const signInDto = {
        username: 'testtesttest',
        password: 'Testtest!',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      usersService.findOneByUsername.mockReturnValue(signInDto);
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        new UnauthorizedException('invalid password'),
      );
    });
  });

  describe('getCookieWithJwtAccessToken', () => {
    it('should return a cookie', () => {
      const user = {
        id: 1,
        username: 'testtesttest',
        role: 'ADMIN',
      } as UserEntity;
      const accessToken = 'accessToken';
      const secret = configService.get('JWT_ACCESS_TOKEN_SECRET');
      const expiresIn = configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME');
      const result = {
        accessToken,
        domain: configService.get('DOMAIN'),
        path: '/',
        httpOnly: true,
      };

      (jwtService.sign as jest.Mock).mockReturnValue(accessToken);
      expect(jwtService.sign(user, { secret, expiresIn })).toEqual(accessToken);
      expect(authService.getCookieWithJwtAccessToken(user)).toEqual(result);
    });
  });

  describe('getCookieWithJwtRefreshToken', () => {
    it('should return a cookie', () => {
      const user = {
        id: 1,
        username: 'testtesttest',
        role: 'ADMIN',
      } as UserEntity;
      const refreshToken = 'refreshToken';
      const secret = configService.get('JWT_REFRESH_TOKEN_SECRET');
      const expiresIn = configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
      const result = {
        refreshToken,
        domain: configService.get('DOMAIN'),
        path: '/',
        httpOnly: true,
      };

      (jwtService.sign as jest.Mock).mockReturnValue(refreshToken);
      expect(jwtService.sign(user, { secret, expiresIn })).toEqual(
        refreshToken,
      );
      expect(authService.getCookieWithJwtRefreshToken(user)).toEqual(result);
    });
  });

  describe('getCookiesForLogOut', () => {
    it('should return a cookie', () => {
      const accessOption = {
        domain: configService.get('DOMAIN'),
        path: '/',
        httpOnly: true,
        maxAge: 0,
      };
      const refreshOption = {
        domain: configService.get('DOMAIN'),
        path: '/',
        httpOnly: true,
        maxAge: 0,
      };
      const result = {
        accessOption,
        refreshOption,
      };

      expect(authService.getCookiesForLogOut()).toEqual(result);
    });
  });
});
