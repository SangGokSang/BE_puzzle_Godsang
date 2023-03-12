import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserNickname = createParamDecorator(
  (data, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest();
    return req.user.nickname;
  },
);
