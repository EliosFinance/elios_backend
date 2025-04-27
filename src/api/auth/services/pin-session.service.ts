import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PinSessionService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;

    onModuleInit(): any {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }

    onModuleDestroy(): any {
        this.redisClient.quit();
    }

    async setPinVerified(userId: number, sessionId: string): Promise<void> {
        await this.redisClient.set(`pin_verified:${userId}:${sessionId}`, 'true', 'EX', 3600);
    }

    async isPinVerified(userId: number, sessionId: string): Promise<boolean> {
        const verified = await this.redisClient.get(`pin_verified:${userId}: ${sessionId}`);
        return verified === 'true';
    }

    async clearPinVerification(userId: number, sessionId: string): Promise<void> {
        await this.redisClient.del(`pin_verified:${userId}:${sessionId}`);
    }

    generateSessionId(): string {
        return uuidv4();
    }
}
