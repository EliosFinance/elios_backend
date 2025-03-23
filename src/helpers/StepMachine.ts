import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CHALLENGE_WORKER_QUEUE } from '@src/types/ChallengeWorkerTypes';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { AnyEventObject, SnapshotFrom, createActor, createMachine } from 'xstate';
import { Challenge } from '../api/challenges/entities/challenge.entity';
import { UserToChallenge } from '../api/challenges/entities/usertochallenge.entity';

@Injectable()
export class StepMachine {
    constructor(
        @InjectRepository(Challenge)
        private challengeRepo: Repository<Challenge>,

        @InjectRepository(UserToChallenge)
        private userToChallengeRepo: Repository<UserToChallenge>,

        @Inject(CHALLENGE_WORKER_QUEUE)
        private readonly challengeQueue: Queue,
    ) {}

    async nextStep(userId: number, challengeId: number): Promise<UserToChallenge> {
        const userChallenge = await this.userToChallengeRepo.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });

        if (!userChallenge) {
            throw new Error(`Cannot find user challenge with userId: ${userId} and challengeId: ${challengeId}`);
        }

        await this.challengeQueue.add('process-challenge-step', { userId, challengeId });

        return userChallenge;
    }

    async getCurrentStep(userId: number, challengeId: number): Promise<string> {
        const userChallenge = await this.userToChallengeRepo.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });

        if (!userChallenge) {
            throw new Error(`User challenge not found with userId: ${userId} and challengeId: ${challengeId}`);
        }

        return userChallenge.currentState;
    }
}
