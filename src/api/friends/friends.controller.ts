import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { RewardType } from '@src/api/challenges/entities/reward.entity';
import { QuizzFinisher } from '@src/api/quizz/entities/quizz-finisher';
import { UserLightType } from 'src/api/users/dto/user-light.dto';
import { Repository } from 'typeorm';
import { AcceptFriendsDto } from './dto/accept-friend.dto';
import { AddFriendsDto } from './dto/add-friend.dto';
import { RejectFriendsDto } from './dto/reject-friend.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
@ApiTags('Friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) {}

    @Get('search')
    async searchUsers(
        @Query('query') query: string,
        @Query('currentUserId') currentUserId: number,
    ): Promise<UserLightType[]> {
        const users = await this.friendsService.searchUsers(query, currentUserId);
        return users.map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
        }));
    }

    @Get(':userId')
    getFriends(@Param('userId') userId: number) {
        return this.friendsService.getFriendsWithScores(userId);
    }

    @Get(':id')
    async getFriendById(@Param('id', ParseIntPipe) id: number) {
        const friendsArray = await this.friendsService.getFriendsWithScores(id);
        const friend = friendsArray.find((f) => f.id === id);

        if (!friend) {
            throw new NotFoundException('Friend not found');
        }
        return friend;
    }

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

    @Get('requests/received')
    getReceivedRequests(@Query('userId', ParseIntPipe) userId: number) {
        return this.friendsService.getReceivedFriendRequests(userId);
    }

    @Get('requests/sent')
    getSentRequests(@Query('userId', ParseIntPipe) userId: number) {
        return this.friendsService.getSentFriendRequests(userId);
    }

    @Post('add-by-code')
    async addFriendByCode(@Body() dto: { currentUserId: number; referralCode: string }) {
        return this.friendsService.addFriendByReferralCode(dto.currentUserId, dto.referralCode);
    }
}
