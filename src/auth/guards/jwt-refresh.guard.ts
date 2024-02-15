import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { ErrorMessages } from '../../constants/error-messages.enum';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request?.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException(ErrorMessages.JWT_REFRESH_TOKEN_INVALID);
    }

    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          ErrorMessages.JWT_REFRESH_TOKEN_UNAUTHORIZED,
        );
      } else {
        throw new UnauthorizedException(
          ErrorMessages.JWT_REFRESH_TOKEN_INVALID,
        );
      }
    }
    await super.canActivate(context);

    return true;
  }
}
