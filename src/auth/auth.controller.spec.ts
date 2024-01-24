import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';

const mockAuthService = {
  signIn: jest.fn(),
  signUp: jest.fn(),
  getCookiesForLogOut: jest.fn(),
  getCookieWithJwtAccessToken: jest.fn(),
};
const mockUsersService = {
  removeRefreshToken: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should return true', async () => {
      const signUpDto = {
        username: 'test@gmail.com',
        password: 'Testtest!1',
      };

      await controller.signUp(signUpDto);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should sign in user and set headers/cookies', async () => {
      const accessToken = 'mockAccessToken';
      const refreshToken = 'mockRefreshToken';
      const response = {
        setHeader: jest.fn(),
        cookie: jest.fn(),
      };
      const signInDto: SignInDto = {
        username: 'testman',
        password: 'Testtest!1',
      };

      jest.spyOn(authService, 'signIn').mockImplementation(async () => ({
        accessTokenData: {
          accessToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
        },
        refreshTokenData: {
          refreshToken,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
        },
      }));

      await controller.signIn(signInDto, response as any);
      expect(response.setHeader).toHaveBeenCalledWith(
        'Authorization',
        'Bearer ' + [accessToken, refreshToken],
      );
      expect(response.cookie).toHaveBeenCalledWith('accessToken', accessToken, {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      });
      expect(response.cookie).toHaveBeenCalledWith(
        'refreshToken',
        refreshToken,
        { domain: 'localhost', path: '/', httpOnly: true },
      );
    });
  });

  describe('signOut', () => {
    it('should sign out user and clear cookies', async () => {
      const response = {
        cookie: jest.fn(),
      };
      const req = {
        user: {
          id: 1,
        },
      };
      const accessOption = {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      };
      const refreshOption = {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      };

      jest
        .spyOn(authService, 'getCookiesForLogOut')
        .mockImplementation(() => ({ accessOption, refreshOption }));

      await controller.signOut(response as any, req as any);
      const { accessOption: ao, refreshOption: ro } =
        authService.getCookiesForLogOut();
      expect(usersService.removeRefreshToken).toHaveBeenCalledWith(1);
      expect(response.cookie).toHaveBeenCalledWith('accessToken', '', ao);
      expect(response.cookie).toHaveBeenCalledWith('refreshToken', '', ro);
    });
  });

  describe('refresh', () => {
    it('should refresh token', async () => {
      const accessToken = 'mockAccessToken';
      const response = {
        cookie: jest.fn(),
      };
      const req = {
        user: {
          id: 1,
        },
      };
      const accessData = {
        accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      };
      const accessOption = {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
      };

      jest
        .spyOn(authService, 'getCookieWithJwtAccessToken')
        .mockImplementation(() => accessData);
      expect(await controller.refresh(req as any, response as any)).toBe(true);
      expect(response.cookie).toHaveBeenCalledWith(
        'accessToken',
        accessToken,
        accessOption,
      );
    });
  });
});
