import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateContentTypeDto } from '../../content-type/dto/create-content-type.dto';
import { ArticleContentType } from '../entities/article-content.entity';

export enum UpdateMode {
    REPLACE = 'replace',
    ADD = 'add',
}

export class UpdateArticleContentDto {
    @IsOptional()
    @IsString({ message: "The 'image' field must be a string" })
    image?: string;

    @IsOptional()
    @IsString({ message: "The 'title' field must be a string" })
    title?: string;

    @IsOptional()
    @IsEnum(ArticleContentType, { message: "The 'type' field must be a valid ArticleContentType value" })
    type?: ArticleContentType;

    @IsOptional()
    @IsArray({ message: "Le champ 'contentType' doit être un tableau d'éléments." })
    @ValidateNested({ each: true })
    @Type(() => CreateContentTypeDto)
    contentType: CreateContentTypeDto[];

    @IsOptional()
    @IsEnum(UpdateMode, { message: "The 'updateMode' field must be either 'replace' or 'add'" })
    updateMode?: UpdateMode;
}
