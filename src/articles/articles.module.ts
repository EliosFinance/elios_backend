import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleCategory } from '../article-category/entities/article-category.entity';
import { ArticleContent } from '../article-content/entities/article-content.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentType } from '../content-type/entities/content-type.entity';
import { User } from '../users/entities/user.entity';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Article, User, ArticleCategory, ArticleContent, ContentType])],
    controllers: [ArticlesController],
    providers: [ArticlesService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class ArticlesModule {}
