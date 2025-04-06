import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ChallengeProcessor } from '@src/workers/challenge.worker';
import { LoggingInterceptor } from '../logging.interceptor';
import { AppModule } from './app.module'; // Ensure AppModule is imported
import { ChallengesModule } from './challenges/challenges.module'; // Import ChallengesModule

@Module({
    imports: [
        AppModule,
        ChallengesModule,
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '', 10),
            },
        }),
        BullModule.registerQueue({
            name: 'challenge',
        }),
    ],
    controllers: [],
    providers: [
        ChallengeProcessor,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppWorkerModule {}
