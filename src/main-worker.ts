import { NestFactory } from '@nestjs/core';
import { AppWorkerModule } from './api/app-worker.module';

async function bootstrap() {
    const app = await NestFactory.create(AppWorkerModule, { cors: true });
    await app.listen(3334);
}
bootstrap();
