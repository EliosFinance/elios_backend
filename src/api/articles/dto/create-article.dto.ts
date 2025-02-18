import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateArticleContentDto } from '../../article-content/dto/create-article-content-dto';

export class CreateArticleDto {
    @IsNotEmpty({ message: "The 'title' field is required" })
    @IsString({ message: 'The title field must be a string' })
    title: string;

    @IsNotEmpty({ message: "The 'description' field is required" })
    @IsString({ message: 'The description field must be a string' })
    description: string;

    @IsNotEmpty({ message: "The 'authorIds' field is required" })
    @IsArray({ message: "The 'authorIds' field must be an array of number" })
    @IsInt({ each: true })
    authorIds: number[];

    @IsNotEmpty({ message: "The 'contents' field is required" })
    @ValidateNested({ each: true })
    @IsArray({ message: "Le champ 'contents' doit être un tableau d'éléments" })
    @Type(() => CreateArticleContentDto)
    contents: CreateArticleContentDto[];

    @IsNotEmpty({ message: "The 'thumbnail' field is required" })
    @IsString({ message: 'The thumbnail field must be a string' })
    thumbnail: string;

    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;

    @IsNotEmpty({ message: "The 'categoryId' field is required" })
    @IsInt({ message: "The 'categoryId' field must be a number" })
    categoryId: number;

    @IsOptional()
    @IsInt()
    readingTime?: number;
}
