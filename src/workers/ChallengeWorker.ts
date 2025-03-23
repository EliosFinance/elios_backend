import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Challenge } from '@src/api/challenges/entities/challenge.entity';
import { UserToChallenge } from '@src/api/challenges/entities/usertochallenge.entity';
import { CHALLENGE_WORKER_NAME, CHALLENGE_WORKER_QUEUE } from '@src/types/ChallengeWorkerTypes';
import { Queue, Worker } from 'bullmq';
import { Repository } from 'typeorm';
import { createActor, createMachine } from 'xstate';

@Injectable()
export class ChallengeWorker {
    constructor(
        @InjectQueue(CHALLENGE_WORKER_NAME)
        private readonly challengeQueue: Queue,
        @InjectRepository(UserToChallenge)
        private readonly userToChallengeRepository: Repository<UserToChallenge>,
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
    ) {
        this.startWorker();
    }

    async addChallengeToQueue(challengeId: number) {
        await this.challengeQueue.add('process-challenge', { challengeId });
    }

    startWorker() {
        new Worker(CHALLENGE_WORKER_NAME, async (job) => {
            const { userId, challengeId } = job.data;

            const userChallenge = await this.userToChallengeRepository.findOne({
                where: { user: { id: userId }, challenge: { id: challengeId } },
            });
            const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } });

            if (!userChallenge || !challenge) {
                throw new Error(`Cannot find userChallenge or challenge`);
            }

            // Charger la state machine depuis la config stockée
            const machine = createMachine(challenge.stateMachineConfig);
            const actor = createActor(machine);
            actor.start();

            // Déterminer l'événement possible
            const possibleEvents = machine.events.filter((event) => {
                const newState = machine.transition(actor.getSnapshot(), { type: event }, null);
                return newState !== actor.getSnapshot();
            });

            if (possibleEvents.length === 0) {
                throw new Error(`No possible events for user ${userId} in challenge ${challengeId}`);
            }

            const nextEvent = possibleEvents[0]; // Choisir le premier événement disponible
            actor.send({ type: nextEvent });

            // Mettre à jour en base de données
            userChallenge.currentState = String(actor.getSnapshot().value);
            await this.userToChallengeRepository.save(userChallenge);
        });
    }
}
