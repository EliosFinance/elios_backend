import { IsInt, IsNotEmpty } from 'class-validator';

export class AcceptFriendsDto {
    @IsInt()
    @IsNotEmpty()
    currentUserId: number;

    @IsInt()
    @IsNotEmpty()
    requesterId: number;
}
