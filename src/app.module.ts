import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleCategoryModule } from './article-category/article-category.module';
import { ArticleContentModule } from './article-content/article-content.module';
import { ArticlesModule } from './articles/articles.module';
import { AuthModule } from './auth/auth.module';
import { ChallengesModule } from './challenges/challenges.module';
import { ContentTypeModule } from './content-type/content-type.module';
import { EnterprisesModule } from './enterprises/enterprises.module';
import { PowensModule } from './powens/powens.module';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
import 'dotenv/config';
import dataSource from '../data-source';

@Module({
    imports: [
        TypeOrmModule.forRoot(dataSource.options),
        PowensModule,
        AuthModule,
        UsersModule,
        TransactionsModule,
        ArticlesModule,
        EnterprisesModule,
        ChallengesModule,
        ArticleCategoryModule,
        ArticleContentModule,
        ContentTypeModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
