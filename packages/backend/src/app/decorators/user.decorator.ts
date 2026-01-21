import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserPayload } from '../interfaces/auth.interface';

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): IUserPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
