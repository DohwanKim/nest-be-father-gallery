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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({
    status: 201,
    type: Boolean,
    description: '회원가입 성공 및 회원 생성',
  })
  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        accessToken: {
          type: 'string',
          description: '액세스 토큰',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidXNlcm5hbWUiOiJhZG1pbjIiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDY2OTc1NjksImV4cCI6MTcwNjY5OTM2OX0.6U3QBmUnlsif23a4-XemxU5XbxnfFHFpl7o3gWwrxjA',
        },
        refreshToken: {
          type: 'string',
          description: '리플래시 토큰',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNzA2Njk3NTY5LCJleHAiOjE3MDczMDIzNjl9.aCcM8z84roiMGKQZWOVGr_b8jtvbkDp5EGQy3W63nqM',
        },
      },
    },
    description:
      '로그인 성공 및 액세스 토큰, 리플래시 토큰 리턴 및 httponly 로도 쿠키가 포함됨',
  })
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
    res.statusCode = 200;

    return { accessToken, refreshToken };
  }

  // TODO: 타입스크립트 코드 리펙토링 관련 - req 타입을 Request 와 user가 둘다 들어있는 타입으로 만들어주기
  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: '로그아웃 성공 및 쿠키 삭제',
  })
  @Post('/signout')
  @UseGuards(JwtRefreshGuard)
  async signOut(@Res({ passthrough: true }) res: Response, @Req() req: any) {
    const { accessOption, refreshOption } =
      this.authService.getCookiesForLogOut();

    await this.usersService.removeRefreshToken(req.user.id);
    res.cookie('accessToken', '', accessOption);
    res.cookie('refreshToken', '', refreshOption);
    res.statusCode = 200;

    return true;
  }

  @ApiOperation({ summary: '리플래시 토큰으로 액세스 토큰 갱신' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: Boolean,
    description: '액세스 토큰 갱신 성공 및 쿠키에 액세스 토큰 저장',
  })
  @ApiUnauthorizedResponse({
    description: '리플래시 토큰 만료 시 Unauthorized',
  })
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
