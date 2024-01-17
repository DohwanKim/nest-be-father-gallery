import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessTokenData, refreshTokenData } =
      await this.authService.signIn(signInDto);
    const { accessToken, ...accessOption } = accessTokenData;
    const { refreshToken, ...refreshOption } = refreshTokenData;

    res.setHeader('Authorization', 'Bearer ' + [accessToken, refreshToken]);
    res.cookie('accessToken', accessToken, accessOption);
    res.cookie('refreshToken', refreshToken, refreshOption);

    return { accessToken, refreshToken };
  }

  // TODO: req 타입을 Request 와 user가 둘다 들어있는 타입으로 만들어주기
  @Post('/signout')
  @UseGuards(JwtRefreshGuard)
  async signOut(@Res({ passthrough: true }) res: Response, @Req() req: any) {
    const { accessOption, refreshOption } =
      this.authService.getCookiesForLogOut();

    await this.usersService.removeRefreshToken(req.user.id);
    res.cookie('accessToken', '', accessOption);
    res.cookie('refreshToken', '', refreshOption);

    return true;
  }

  @Get('/refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const { accessToken, ...accessOption } =
      this.authService.getCookieWithJwtAccessToken(user.id);

    res.cookie('accessToken', accessToken, accessOption);

    return true;
  }
}
