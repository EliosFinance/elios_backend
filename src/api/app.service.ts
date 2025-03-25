import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class AppService {
    constructor(
        @InjectQueue('challenge')
        private readonly queue: Queue,
    ) {}

    getHello(): string {
        return 'Hello World!';
    }

    async test(): Promise<string> {
        await this.queue.add('challenge', { test: 'test' });
        return 'test';
    }
}
