import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { ContentType } from '../content-type/entities/content-type.entity';
import { User } from '../users/entities/user.entity';
import { ArticleContentController } from './article-content.controller';
import { ArticleContentService } from './article-content.service';
import { ArticleContent } from './entities/article-content.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ArticleContent, User, ContentType, Article])],
    controllers: [ArticleContentController],
    providers: [ArticleContentService],
})
export class ArticleContentModule {}
