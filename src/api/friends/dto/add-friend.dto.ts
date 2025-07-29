import { IsInt, IsNotEmpty } from 'class-validator';

export class AddFriendsDto {
    @IsInt()
    @IsNotEmpty()
    fromUserId: number;

    @IsInt()
    @IsNotEmpty()
    toUserId: number;
}
