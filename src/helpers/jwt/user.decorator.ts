import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from '@src/api/users/entities/user.entity';

export const UserFromRequest = createParamDecorator((_data: any, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.user);

    return request.user;
});
