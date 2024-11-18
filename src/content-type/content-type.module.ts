import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleContent } from '../article-content/entities/article-content.entity';
import { ContentTypeController } from './content-type.controller';
import { ContentTypeService } from './content-type.service';
import { ContentType } from './entities/content-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ContentType, ArticleContent])],
    controllers: [ContentTypeController],
    providers: [ContentTypeService],
})
export class ContentTypeModule {}
