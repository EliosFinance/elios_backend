import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Challenge } from '@src/api/challenges/entities/challenge.entity';
import { UserToChallenge } from '@src/api/challenges/entities/usertochallenge.entity';
import { CHALLENGE_WORKER_NAME } from '@src/types/ChallengeWorkerTypes';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { createActor, createMachine } from 'xstate';

@Processor(CHALLENGE_WORKER_NAME)
@Injectable()
export class ChallengeProcessor {
    private readonly logger = new Logger(ChallengeProcessor.name);

    constructor(
        @InjectRepository(UserToChallenge)
        private readonly userToChallengeRepository: Repository<UserToChallenge>,
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
    ) {}

    @Process('process-challenge')
    async handleChallengeProcess(job: Job<{ userId: number; challengeId: number }>) {
        const { userId, challengeId } = job.data;
        this.logger.log(`Processing challenge ${challengeId} for user ${userId}`);

        const userChallenge = await this.userToChallengeRepository.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });

        const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } });

        if (!userChallenge || !challenge) {
            throw new Error('Challenge or UserChallenge not found');
        }

        // Charger la machine XState avec l’état actuel
        const machine = createMachine({
            ...challenge.stateMachineConfig,
            context: { currentState: userChallenge.currentState },
        });
        const actor = createActor(machine.provide({}));
        actor.start();

        // Déterminer si une transition est possible
        const nextTransitions = machine.getTransitionData(actor.getSnapshot(), { type: 'NEXT' });

        if (!nextTransitions || nextTransitions.length === 0) {
            this.logger.warn(`No transition possible for user ${userId} on challenge ${challengeId}`);
            return;
        }

        // Effectuer la transition
        actor.send({ type: 'NEXT' });

        // Mettre à jour l’état en base
        userChallenge.currentState = String(actor.getSnapshot().value);
        await this.userToChallengeRepository.save(userChallenge);

        this.logger.log(`Challenge ${challengeId} for user ${userId} updated to state ${userChallenge.currentState}`);
    }
}
