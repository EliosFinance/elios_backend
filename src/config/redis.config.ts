import { Queue, Worker } from 'bullmq';

export const redisConfig = {
    connection: {
        host: '127.0.0.1',
        port: 6379,
    },
};

export const challengeQueue = new Queue('challenge-queue', redisConfig);
