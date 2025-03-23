import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppWorkerModule } from './api/app-worker.module';
import { ChallengeWorker } from './workers/ChallengeWorker';

const LOGGER = new Logger('Main-Worker');
export const PORT_WORKER = 3001;
(async () => {
    const APP_LOGGER = new Logger('nest');
    const app = await NestFactory.create(AppWorkerModule, {
        logger: APP_LOGGER,
    });
    const dataSource = app.get(TypeOrmModule);
    if (!dataSource) {
        throw new Error('TypeOrmModule not initialized properly!');
    }
    // await app.listen(PORT_WORKER);
    // APP_LOGGER.warn(`start on : http://localhost:${PORT_WORKER}`);

    while (true) {
        setTimeout(() => {
            LOGGER.verbose('ping');
        }, 5000);
    }
})();
