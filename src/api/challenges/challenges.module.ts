import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CHALLENGE_WORKER_QUEUE_PROVIDER } from '@src/types/ChallengeWorkerTypes';
import { Queue } from 'bullmq';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { User } from '../users/entities/user.entity';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { Challenge } from './entities/challenge.entity';
import { Reward } from './entities/reward.entity';
import { UserToChallenge } from './entities/usertochallenge.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Challenge, Enterprise, User, UserToChallenge, Reward])],
    controllers: [ChallengesController],
    providers: [ChallengesService, CHALLENGE_WORKER_QUEUE_PROVIDER],
    exports: [CHALLENGE_WORKER_QUEUE_PROVIDER],
})
export class ChallengesModule {}
