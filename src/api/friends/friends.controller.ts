import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AcceptFriendsDto } from './dto/accept-friends.dto';
import { AddFriendsDto } from './dto/add-friends.dto';
import { RejectFriendsDto } from './dto/reject-friends.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
@ApiTags('Friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @Post('request')
    sendRequest(@Body() body: AddFriendsDto) {
        return this.friendsService.addFriendRequest(body.fromUserId, body.toUserId);
    }

    @Post('accept')
    acceptRequest(@Body() body: AcceptFriendsDto) {
        return this.friendsService.acceptFriendRequest(body.currentUserId, body.requesterId);
    }

    @Post('reject')
    rejectRequest(@Body() body: RejectFriendsDto) {
        return this.friendsService.rejectFriendRequest(body.currentUserId, body.requesterId);
    }

    @Get(':userId')
    getFriends(@Param('userId') userId: number) {
        return this.friendsService.getFriends(userId);
    }
}
