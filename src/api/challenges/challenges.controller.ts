import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { ChallengesService } from './challenges.service';
import { AddUsersDto } from './dto/add-users.dto';
import { CreateChallengeDto } from './dto/create-challenge-dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeType } from './entities/challenge.entity';
import { UserToChallenge } from './entities/usertochallenge.entity';

@Controller('challenges')
@ApiTags('Challenges')
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) {}

    @Post()
    create(@Body() createChallengeDto: CreateChallengeDto): Promise<ChallengeType> {
        return this.challengesService.create(createChallengeDto);
    }

    @Get()
    findAll(): Promise<ChallengeType[]> {
        return this.challengesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<ChallengeType> {
        return this.challengesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateChallengeDto: UpdateChallengeDto): Promise<ChallengeType> {
        return this.challengesService.update(+id, updateChallengeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.challengesService.remove(+id);
    }

    @Post(':challengeId/start')
    async StartChallenge(@Param('challengeId') challengeId: number, @UserFromRequest() user): Promise<UserToChallenge> {
        return this.challengesService.startChallengeForUser(user.id, challengeId);
    }

    @Post(':challengeId/update')
    async UpdateUserChallenge(
        @Param('challengeId') challengeId: number,
        @UserFromRequest() user,
    ): Promise<UserToChallenge> {
        return this.challengesService.updateUserChallenge(user.id, challengeId);
    }
}
