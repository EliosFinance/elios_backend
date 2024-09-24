import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import 'dotenv/config';

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage implements OnApplicationBootstrap, OnApplicationShutdown {
    private redisClient: Redis;
    onApplicationBootstrap(): any {
        this.redisClient = new Redis(6379, process.env.REDIS_HOST || '127.0.0.1');
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
