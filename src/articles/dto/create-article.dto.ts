import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateArticleContentDto } from '../../article-content/dto/create-article-content-dto';

export class CreateArticleDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsArray()
    @IsInt({ each: true })
    authorIds: number[];

    @ValidateNested({ each: true })
    @IsArray({ message: "Le champ 'contents' doit être un tableau d'éléments" })
    @Type(() => CreateArticleContentDto)
    contents: CreateArticleContentDto[];

    @IsOptional()
    @IsString()
    thumbnail: string;

    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;

    @IsNotEmpty()
    @IsInt()
    categoryId: number;

    @IsOptional()
    @IsInt()
    readingTime?: number;
}
