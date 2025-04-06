import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '@src/api/users/entities/user.entity';

export const UserFromRequest = createParamDecorator((_data: any, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
        throw new Error('User not found in request');
    }
    return request.user;
});
