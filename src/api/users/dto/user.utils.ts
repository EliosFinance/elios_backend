import { User } from '../entities/user.entity';
import { UserLightType } from './user-light.dto';

export function toUserLight(user: User): UserLightType {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
    };
}

export function toUserLightList(users: User[]): UserLightType[] {
    return users?.map(toUserLight) ?? [];
}
