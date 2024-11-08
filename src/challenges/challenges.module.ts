import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { User } from '../users/entities/user.entity';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { Challenge } from './entities/challenge.entity';
import { UserToChallenge } from './entities/usertochallenge.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Challenge, Enterprise, User, UserToChallenge])],
    controllers: [ChallengesController],
    providers: [ChallengesService],
})
export class ChallengesModule {}
