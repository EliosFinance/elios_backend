import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ChallengesService } from '@src/api/challenges/challenges.service';
import { CHALLENGE_QUEUE_NAME, ChallengeEventEnum, ChallengeStepsEnum } from '@src/types/challengeStepsTypes';
import { Job } from 'bullmq';
import { createActor, createMachine } from 'xstate';

const LOGGER = new Logger('ChallengeProcessor');

@Processor(CHALLENGE_QUEUE_NAME, { limiter: { max: 10, duration: 1 * 1000 * 60 * 5 /* 5min */ } })
export class ChallengeProcessor extends WorkerHost {
    constructor(private readonly challengeService: ChallengesService) {
        super();
    }

    async process(job: Job) {
        LOGGER.log(`Processing job ${job.id} for user ${job.data.userId}, challenge ${job.data.challengeId}`);

        try {
            const { userId, challengeId } = job.data;

            let userChallenge = await this.challengeService.getUserChallenge(userId, challengeId);
            if (!userChallenge) {
                userChallenge = await this.challengeService.addUserToChallenge(userId, challengeId);
            }
            LOGGER.log(`Fetched challenge ${challengeId} state: ${userChallenge.currentState}`);

            const challenge = await this.challengeService.findFullOne(challengeId);
            if (!challenge) {
                throw new Error(`Challenge not found for challengeId: ${challengeId}`);
            }

            // State machine
            const machineConfig = challenge.stateMachineConfig;
            const machine = createMachine({ ...machineConfig, context: { currentState: userChallenge.currentState } });
            const actor = createActor(machine);
            actor.start();

            const currentState = userChallenge.currentState;
            const possibleTransitions = machineConfig.states[String(currentState)]?.on;
            if (!possibleTransitions) {
                if (currentState === ChallengeStepsEnum.END) {
                    LOGGER.log(`Challenge ${challengeId} is already in state END, skipping update.`);
                    return;
                }
                throw new Error(`No transitions defined for state: ${currentState}`);
            }

            LOGGER.log(`Possible transitions from ${currentState}: ${JSON.stringify(possibleTransitions)}`);

            const nextTransition = Object.entries(possibleTransitions).find(([event, transition]) => {
                return (
                    typeof transition === 'object' &&
                    transition !== null &&
                    'target' in (transition as { target?: string }) &&
                    (transition as { target?: string }).target !== undefined
                );
            });

            if (!nextTransition) {
                LOGGER.warn(`No valid transition for state: ${currentState}, skipping update.`);
                return;
            }

            const [nextEvent, transition] = nextTransition;
            const nextState = (transition as { target: string }).target;

            LOGGER.log(
                `Transitioning challenge ${challengeId} from ${currentState} with event ${nextEvent} to ${nextState}`,
            );
            actor.send({ type: nextEvent });

            userChallenge.currentState = nextState;

            await this.challengeService.updateUserChallengeState(userChallenge);
        } catch (error) {
            LOGGER.error('Error processing job', error);
            throw error;
        }
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        console.log(`Job ${job.id} on challenge ${job.data?.challengeId} PROCESSING!`);
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        console.log(`Job ${job.id} on challenge ${job.data?.challengeId} OK!`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job) {
        console.log(`Job ${job.id} on challenge ${job.data?.challengeId} FAILED!`);
    }
}
