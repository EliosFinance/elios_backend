import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateContentTypeDto } from '../../content-type/dto/create-content-type.dto';
import { ArticleContentType } from '../entities/article-content.entity';

export class CreateArticleContentDto {
    @IsNotEmpty({ message: "The 'image' field is required" })
    @IsString()
    image: string;

    @IsNotEmpty({ message: "The 'title' field is required" })
    @IsString()
    title: string;

    @IsNotEmpty({ message: "The 'type' field is required" })
    @IsEnum(ArticleContentType, { message: "The 'type' field must be a valid ArticleContentType value" })
    type: ArticleContentType;

    @IsOptional()
    @IsArray({ message: "The 'readsUserId' field must be an array" })
    readsUserId: number[];

    @IsOptional()
    @IsArray({ message: "The 'savedUserId' field must be an array" })
    savedUserId: number[];

    @IsNotEmpty({ message: "The 'contentType' field is required" })
    @IsArray({ message: 'Le champ "contentType" doit être un tableau d’éléments.' })
    @ValidateNested({ each: true })
    @Type(() => CreateContentTypeDto)
    contentType: CreateContentTypeDto[];

    @IsOptional()
    @IsInt({ message: "The 'articleId' field must be an integer" })
    articleId: number;
}
