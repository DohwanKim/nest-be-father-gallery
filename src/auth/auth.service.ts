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
  private readonly tokenOptionBase = {
    domain: this.configService.get('DOMAIN'),
    path: '/',
    httpOnly: true,
  };

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
    const user = await this.userService.findOneByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessTokenData = this.getCookieWithJwtAccessToken(user);
      const refreshTokenData = this.getCookieWithJwtRefreshToken(user);

      await this.userService.setUserCurrentRefreshToken(
        refreshTokenData.refreshToken,
        user.id,
      );

      return { accessTokenData, refreshTokenData };
    } else {
      throw new UnauthorizedException('invalid password');
    }
  }

  getCookieWithJwtAccessToken(user: UserEntity) {
    const payload = { id: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
    });

    return {
      ...this.tokenOptionBase,
      accessToken: token,
    };
  }

  getCookieWithJwtRefreshToken(user: UserEntity) {
    const payload = { id: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    });

    return {
      ...this.tokenOptionBase,
      refreshToken: token,
    };
  }

  getCookiesForLogOut() {
    const logoutOption = {
      ...this.tokenOptionBase,
      maxAge: 0,
    };

    return {
      accessOption: logoutOption,
      refreshOption: logoutOption,
    };
  }
}
