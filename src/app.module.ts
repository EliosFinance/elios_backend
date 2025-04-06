import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './api/auth/auth.module';
import { ChallengesModule } from './api/challenges/challenges.module';
import { ContentTypeModule } from './api/content-type/content-type.module';
import { EnterprisesModule } from './api/enterprises/enterprises.module';
import { PowensModule } from './api/powens/powens.module';
import { TransactionsModule } from './api/transactions/transactions.module';
import { UsersModule } from './api/users/users.module';
import 'dotenv/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ArticlesModule } from './api/articles/articles.module';
import { QuizzModule } from './api/quizz/quizz.module';
import { AppService } from './app.service';
import { LoggingInterceptor } from './logging.interceptor';

console.warn('POSTGRES_HOST', process.env.POSTGRES_HOST);
console.warn('POSTGRES_PORT', process.env.POSTGRES_PORT);
console.warn('POSTGRES_USER', process.env.POSTGRES_USER);
console.warn('POSTGRES_PASSWORD', process.env.POSTGRES_PASSWORD);
console.warn('POSTGRES_DB', process.env.POSTGRES_DB);

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: String(process.env.POSTGRES_HOST),
            port: parseInt(process.env.POSTGRES_PORT, 10),
            username: String(process.env.POSTGRES_USER),
            password: String(process.env.POSTGRES_PASSWORD),
            database: String(process.env.POSTGRES_DB),
            entities: ['**/entity/*.entity.ts'],
            migrations: ['src/migrations/*.ts'],
            synchronize: true,
            logging: true,
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
        PrometheusModule.register(),
    ],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule {}
