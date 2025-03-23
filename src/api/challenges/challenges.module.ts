import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
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
    providers: [
        ChallengesService,
        {
            provide: 'CHALLENGE_QUEUE',
            useFactory: () => {
                return new Queue('challenge-queue', {
                    connection: new Redis({ host: 'localhost', port: 6379 }),
                });
            },
        },
    ],
    exports: ['CHALLENGE_QUEUE'],
})
export class ChallengesModule {}
