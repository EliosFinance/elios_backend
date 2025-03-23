import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from '@src/api/challenges/entities/challenge.entity';
import { UserToChallenge } from '@src/api/challenges/entities/usertochallenge.entity';
import { CHALLENGE_WORKER_NAME, CHALLENGE_WORKER_QUEUE_PROVIDER } from '@src/types/ChallengeWorkerTypes';
import { ChallengeProcessor } from '@src/workers/ChallengeProcessor';
import { ChallengeWorker } from '@src/workers/ChallengeWorker';

@Module({
    imports: [
        BullModule.registerQueue({
            name: CHALLENGE_WORKER_NAME,
        }),
    ],
    providers: [ChallengeProcessor, ChallengeWorker, CHALLENGE_WORKER_QUEUE_PROVIDER],
    exports: [ChallengeWorker, CHALLENGE_WORKER_NAME],
})
export class AppWorkerModule {}
