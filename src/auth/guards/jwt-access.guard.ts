import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorMessages } from '../../constants/error-messages.enum';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request?.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException(ErrorMessages.JWT_ACCESS_TOKEN_INVALID);
    }

    try {
      jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(
          ErrorMessages.JWT_ACCESS_TOKEN_UNAUTHORIZED,
        );
      } else {
        throw new UnauthorizedException(ErrorMessages.JWT_ACCESS_TOKEN_INVALID);
      }
    }
    await super.canActivate(context);

    return true;
  }
}
