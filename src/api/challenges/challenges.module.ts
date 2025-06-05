import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CHALLENGE_QUEUE_NAME } from '@src/types/challengeStepsTypes';
import { ChallengeQueueEventsListener } from '@src/workers/challenge.queue.events';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { User } from '../users/entities/user.entity';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { Challenge } from './entities/challenge.entity';
import { Reward } from './entities/reward.entity';
import { UserToChallenge } from './entities/usertochallenge.entity';
@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '', 10),
            },
        }),
        BullModule.registerQueue({
            name: CHALLENGE_QUEUE_NAME,
        }),
        TypeOrmModule.forFeature([Challenge, Enterprise, User, UserToChallenge, Reward]),
    ],
    controllers: [ChallengesController],
    providers: [ChallengesService, ChallengeQueueEventsListener],
    exports: [ChallengesService],
})
export class ChallengesModule {}
