import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';
import { ErrorMessages } from '../../constants/error-messages.enum';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      passReqToCallback: true,
    });
  }

  // TODO: 로직 추가 관련 - 무한 로그인 구현 시 여기에 리플래시 만료 시간 계산해서 갱신 하는 거 넣기
  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.refreshToken;
    const { id } = payload;
    const user = await this.usersService.getUserIfRefreshTokenMatches(
      refreshToken,
      id,
    );

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.JWT_REFRESH_TOKEN_INVALID);
    }

    return user;
  }
}
