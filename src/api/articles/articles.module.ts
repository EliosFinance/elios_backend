import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentType } from '../content-type/entities/content-type.entity';
import { User } from '../users/entities/user.entity';
import { ArticleCategoryController } from './controllers/article-category-controller';
import { ArticleContentController } from './controllers/article-content-controller';
import { ArticlesController } from './controllers/articles.controller';
import { ArticleCategory } from './entities/article-category-entity';
import { ArticleContent } from './entities/article-content-entity';
import { Article } from './entities/article.entity';
import { ArticleCategoryService } from './services/article-category-service';
import { ArticleContentService } from './services/article-content-service';
import { ArticlesService } from './services/articles.service';

@Module({
    imports: [TypeOrmModule.forFeature([Article, ArticleCategory, ArticleContent, User, ContentType])],
    controllers: [ArticlesController, ArticleCategoryController, ArticleContentController],
    providers: [
        ArticlesService,
        ArticleCategoryService,
        ArticleContentService,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
    exports: [ArticlesService, ArticleCategoryService, ArticleContentService],
})
export class ArticlesModule {}
