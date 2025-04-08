import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChallengesModule } from './challenges/challenges.module';
import { ContentTypeModule } from './content-type/content-type.module';
import { EnterprisesModule } from './enterprises/enterprises.module';
import { PowensModule } from './powens/powens.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import 'dotenv/config';
import { BullModule } from '@nestjs/bullmq';
import { APP_INTERCEPTOR } from '@nestjs/core';
import dataSource from '@src/api/data-source';
import { RequestLogsModule } from '@src/api/request-logs/request-logs.module';
import { MiddlewareModule } from '@src/middlewares/middleware.module';
import { RequestLoggerMiddleware } from '@src/middlewares/request-logger.middleware';
import { ChallengeQueueEventsListener } from '@src/workers/challenge.queue.events';
import { ChallengeProcessor } from '@src/workers/challenge.worker';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggingInterceptor } from '../logging.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';

console.warn('POSTGRES_HOST', process.env.POSTGRES_HOST);
console.warn('POSTGRES_PORT', process.env.POSTGRES_PORT);
console.warn('POSTGRES_USER', process.env.POSTGRES_USER);
console.warn('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD);
console.warn('POSTGRES_DB', process.env.POSTGRES_DB);

// // log the connexion with the database
// console.warn('DB_STATUS', {
//     type: 'postgres',
//     host: String(process.env.POSTGRES_HOST),
//     port: parseInt(process.env.POSTGRES_PORT, 10),
//     username: String(process.env.POSTGRES_USER),
//     password: String(process.env.POSTGRES_PASSWORD),
//     database: String(process.env.POSTGRES_DB),
//     entities: ['**/entity/*.entity.ts'],
//     synchronize: true,
//     autoLoadEntities: true,
//     logging: false,
// });
@Module({
    imports: [
        // TypeOrmModule.forRoot(dataSource.options),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: String(process.env.POSTGRES_HOST),
            port: parseInt(process.env.POSTGRES_PORT, 10),
            username: String(process.env.POSTGRES_USER),
            password: String(process.env.POSTGRES_PASSWORD),
            database: String(process.env.POSTGRES_DB),
            entities: ['**/entity/*.entity.ts'],
            synchronize: true,
            autoLoadEntities: true,
            logging: false,
        }),
        PowensModule,
        AuthModule,
        UsersModule,
        TransactionsModule,
        EnterprisesModule,
        ChallengesModule,
        ArticlesModule,
        ContentTypeModule,
        RequestLogsModule,
        MiddlewareModule,
        PrometheusModule.register(),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestLoggerMiddleware).forRoutes('*');
    }
}
