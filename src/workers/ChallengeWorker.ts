import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToChallenge } from '@src/api/challenges/entities/usertochallenge.entity';
import { Queue, Worker } from 'bullmq';
import { Repository } from 'typeorm';
import { createActor, createMachine } from 'xstate';

const WORKER_NAME = 'challenge-queue';

@Injectable()
export class ChallengeWorker {
    constructor(
        @Inject('CHALLENGE_QUEUE')
        private challengeQueue: Queue,
        @InjectRepository(UserToChallenge)
        private readonly userToChallengeRepository: Repository<UserToChallenge>,
    ) {
        this.startWorker();
    }

    async addChallengeToQueue(challengeId: number) {
        await this.challengeQueue.add('process-challenge', { challengeId });
    }

    startWorker() {
        new Worker(WORKER_NAME, async (job) => {
            const { userId, challengeId } = job.data;
            const userChallenge = await this.userToChallengeRepository.findOne({
                where: { user: { id: userId }, challenge: { id: challengeId } },
            });

            if (!userChallenge) throw new Error('User challenge state not found');

            const machine = createMachine(userChallenge.stateMachineConfig);
            const actor = createActor(machine);

            actor.start();

            setTimeout(
                () => {
                    actor.send({ type: 'COMPLETE' });
                    userChallenge.currentState = JSON.stringify(actor.getSnapshot().value);
                    this.userToChallengeRepository.save(userChallenge);
                },
                1000 * 60 * 60 * 24,
            ); // 24 heures
        });
    }
}
