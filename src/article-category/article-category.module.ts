import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { ArticleCategoryController } from './article-category.controller';
import { ArticleCategoryService } from './article-category.service';
import { ArticleCategory } from './entities/article-category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ArticleCategory, Article])],
    controllers: [ArticleCategoryController],
    providers: [ArticleCategoryService],
})
export class ArticleCategoryModule {}
