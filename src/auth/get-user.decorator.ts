import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../users/entity/user.entity';

export const GetUserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity =>
    ctx.switchToHttp().getRequest().user,
);
