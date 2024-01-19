import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);
    const newUser = {
      username: signUpDto.username,
      password: hashedPassword,
    };
    await this.userService.createUser(newUser);
  }

  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;
    const user = await this.userService.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessTokenData = this.getCookieWithJwtAccessToken(user);
      const refreshTokenData = this.getCookieWithJwtRefreshToken(user);

      await this.userService.setUserCurrentRefreshToken(
        refreshTokenData.refreshToken,
        user.id,
      );

      return { accessTokenData, refreshTokenData };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  getCookieWithJwtAccessToken(user: UserEntity) {
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    return {
      accessToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    };
  }

  getCookieWithJwtRefreshToken(user: UserEntity) {
    const payload = { id: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    };
  }

  getCookiesForLogOut() {
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }
}
