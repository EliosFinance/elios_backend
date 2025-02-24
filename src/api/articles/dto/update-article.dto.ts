import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateArticleContentDto } from '../../article-content/dto/create-article-content-dto';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto {
    @IsOptional()
    @IsString({ message: 'The title field must be a string' })
    title?: string;

    @IsOptional()
    @IsString({ message: 'The description field must be a string' })
    description?: string;

    @IsOptional()
    @IsArray({ message: "The 'addAuthorIds' field must be an array of number" })
    @IsInt({ each: true })
    addAuthorIds?: number[];

    @IsOptional()
    @IsArray({ message: "The 'replaceAuthorIds' field must be an array of number" })
    @IsInt({ each: true })
    replaceAuthorIds?: number[];

    @IsOptional()
    @ValidateNested({ each: true })
    @IsArray({ message: "The 'addContents' field must be an array" })
    @Type(() => CreateArticleContentDto)
    addContents?: CreateArticleContentDto[];

    @IsOptional()
    @ValidateNested({ each: true })
    @IsArray({ message: "The 'replaceContents' field must be an array" })
    @Type(() => CreateArticleContentDto)
    replaceContents?: CreateArticleContentDto[];

    @IsOptional()
    @IsString({ message: 'The thumbnail field must be a string' })
    thumbnail?: string;

    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;

    @IsOptional()
    @IsInt({ message: "The 'categoryId' field must be a number" })
    categoryId?: number;

    @IsOptional()
    @IsInt()
    readingTime?: number;
}
