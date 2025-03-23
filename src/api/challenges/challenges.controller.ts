import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { AddUsersDto } from './dto/add-users.dto';
import { CreateChallengeDto } from './dto/create-challenge-dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';
import { UserToChallenge } from './entities/usertochallenge.entity';

@Controller('challenges')
@ApiTags('Challenges')
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) {}

    @Post()
    create(@Body() createChallengeDto: CreateChallengeDto): Promise<Challenge> {
        return this.challengesService.create(createChallengeDto);
    }

    @Get()
    findAll(): Promise<Challenge[]> {
        return this.challengesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Challenge> {
        return this.challengesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
        return this.challengesService.update(+id, updateChallengeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.challengesService.remove(+id);
    }

    @Post(':challengeId/user/:userId/start')
    async StartChallenge(
        @Param('challengeId') challengeId: number,
        @Param('userId') userId: number,
    ): Promise<UserToChallenge> {
        return this.challengesService.startChallengeForUser(userId, challengeId);
    }

    @Post(':challengeId/user/:userId/update')
    async UpdateUserChallenge(
        @Param('challengeId') challengeId: number,
        @Param('userId') userId: number,
        @Body() body: { event: string },
    ): Promise<UserToChallenge> {
        return this.challengesService.updateUserChallenge(userId, challengeId, body.event);
    }
}
