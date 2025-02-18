import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import 'dotenv/config';

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage implements OnApplicationBootstrap, OnApplicationShutdown {
    private redisClient: Redis;
    onApplicationBootstrap(): any {
        if (!process.env.REDIS_PORT || isNaN(parseInt(process.env.REDIS_PORT))) {
            throw new Error('REDIS_PORT is not set');
        }
        if (!process.env.REDIS_HOST || !String(process.env.REDIS_HOST)) {
            throw new Error('REDIS_HOST is not set');
        }

        this.redisClient = new Redis(parseInt(process.env.REDIS_PORT), process.env.REDIS_HOST);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onApplicationShutdown(signal?: string): any {
        return this.redisClient.quit();
    }

    async insert(userId: number, tokenId: string): Promise<void> {
        await this.redisClient.set(this.getKey(userId), tokenId);
    }

    async validate(userId: number, tokenId: string): Promise<boolean> {
        const storeId = await this.redisClient.get(this.getKey(userId));
        if (storeId !== tokenId) {
            throw new InvalidatedRefreshTokenError();
        }
        return storeId === tokenId;
    }

    async invalidate(userId: number): Promise<void> {
        await this.redisClient.del(this.getKey(userId));
    }

    private getKey(userId: number): string {
        return `user-${userId}`;
    }
}
