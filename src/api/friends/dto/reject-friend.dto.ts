import { IsInt, IsNotEmpty } from 'class-validator';

export class RejectFriendsDto {
    @IsInt()
    @IsNotEmpty()
    currentUserId: number;

    @IsInt()
    @IsNotEmpty()
    requesterId: number;
}
