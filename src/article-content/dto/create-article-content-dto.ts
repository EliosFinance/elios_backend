import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ArticleContentType } from '../entities/article-content.entity';

export class CreateArticleContentDto {
    @IsNotEmpty()
    @IsString()
    image: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsEnum(ArticleContentType)
    type: ArticleContentType;

    readsUserId: number[];

    savedUserId: number[];

    contentTypeId: number[];

    articleId: number;
}
