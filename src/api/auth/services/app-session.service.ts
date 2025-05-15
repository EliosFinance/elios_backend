import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppSessionService implements OnModuleInit, OnModuleDestroy {
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

    async getLastActiveTime(userId: number, devideId: string): Promise<string | null> {
        return await this.redisClient.get(`last_active:${userId}:${devideId}`);
    }

    async updateLastActiveTime(userId: number, deviceId: string): Promise<void> {
        const now = new Date().toISOString();
        await this.redisClient.set(`last_active:${userId}:${deviceId}`, now);
    }

    async markAppClosed(userId: number, deviceId: string): Promise<void> {
        await this.redisClient.set(`app_closed:${userId}:${deviceId}`, 'true');
    }

    async isAppClosedSinceLastActive(userId: number, deviceId: string): Promise<boolean> {
        const appClosed = await this.redisClient.get(`app_closed:${userId}:${deviceId}`);
        return appClosed === 'true';
    }

    async clearAppClosedStatus(userId: number, deviceId: string): Promise<void> {
        await this.redisClient.del(`app_closed:${userId}:${deviceId}`);
    }

    generateDeviceId(): string {
        return uuidv4();
    }
}
