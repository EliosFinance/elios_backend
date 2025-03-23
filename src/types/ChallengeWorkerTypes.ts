import { Queue } from 'bullmq';
import Redis from 'ioredis';

export const CHALLENGE_WORKER_NAME = 'challenge-queue';
export const CHALLENGE_WORKER_QUEUE_TOKEN = 'CHALLENGE_WORKER_QUEUE';

export const CHALLENGE_WORKER_QUEUE_CONNECTION = new Redis({ host: 'localhost', port: 6379 });

export const CHALLENGE_WORKER_QUEUE = new Queue(CHALLENGE_WORKER_NAME, {
    connection: CHALLENGE_WORKER_QUEUE_CONNECTION,
});

export const CHALLENGE_WORKER_QUEUE_PROVIDER = {
    provide: CHALLENGE_WORKER_NAME,
    useFactory: (queue: Queue) => queue,
    inject: [CHALLENGE_WORKER_NAME],
};
