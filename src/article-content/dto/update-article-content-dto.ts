import { PartialType } from '@nestjs/swagger';
import { CreateArticleContentDto } from './create-article-content-dto';

export class UpdateArticleContentDto extends PartialType(CreateArticleContentDto) {}
