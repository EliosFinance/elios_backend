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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestLogsModule } from '@src/api/request-logs/request-logs.module';
import { MiddlewareModule } from '@src/middlewares/middleware.module';
import { RequestLoggerMiddleware } from '@src/middlewares/request-logger.middleware';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggingInterceptor } from '../logging.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticlesModule } from './articles/articles.module';
import { QuizzModule } from './quizz/quizz.module';

if (process.env.NODE_ENV !== 'production') {
    console.warn('POSTGRES_HOST', process.env.POSTGRES_HOST);
    console.warn('POSTGRES_PORT', process.env.POSTGRES_PORT);
    console.warn('POSTGRES_USER', process.env.POSTGRES_USER);
    console.warn('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD);
    console.warn('POSTGRES_DB', process.env.POSTGRES_DB);
}

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
            synchronize: process.env.NODE_ENV !== 'production',
            autoLoadEntities: true,
            logging: process.env.NODE_ENV !== 'production',
            migrationsRun: process.env.NODE_ENV === 'production',
            migrations: ['dist/migrations/*.js'],
            extra: {
                max: 20,
                min: 5,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            },
        }),
        PowensModule,
        AuthModule,
        UsersModule,
        TransactionsModule,
        EnterprisesModule,
        ChallengesModule,
        QuizzModule,
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
