import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { CreateArticleContentDto } from './article-content-dtos';

export class CreateArticleDto {
    @ApiProperty({
        description: 'Title of the article',
        example: 'Introduction to Finance',
    })
    @IsNotEmpty({ message: "The 'title' field is required" })
    @IsString({ message: "The 'title' field must be a string" })
    title: string;

    @ApiProperty({
        description: 'Description of the article',
        example: 'Learn the basics of personal finance management',
    })
    @IsNotEmpty({ message: "The 'description' field is required" })
    @IsString({ message: "The 'description' field must be a string" })
    description: string;

    @ApiProperty({
        description: 'Array of author IDs who created the article',
        type: [Number],
        example: [1, 2],
    })
    @IsNotEmpty({ message: "The 'authorIds' field is required" })
    @IsArray({ message: "The 'authorIds' field must be an array of numbers" })
    @IsInt({ each: true, message: 'Each authorId must be an integer' })
    authorIds: number[];

    @ApiProperty({
        description: 'Associated content sections for the article',
        type: [CreateArticleContentDto],
    })
    @IsNotEmpty({ message: "The 'contents' field is required" })
    @ValidateNested({ each: true })
    @IsArray({ message: "The 'contents' field must be an array of content objects" })
    @Type(() => CreateArticleContentDto)
    contents: CreateArticleContentDto[];

    @ApiProperty({
        description: 'URL of the article thumbnail image',
        example: 'https://example.com/image.jpg',
    })
    @IsNotEmpty({ message: "The 'thumbnail' field is required" })
    @IsString({ message: "The 'thumbnail' field must be a string" })
    thumbnail: string;

    @ApiPropertyOptional({
        description: 'Whether the article is premium content',
        default: false,
        example: false,
    })
    @IsOptional()
    @IsBoolean({ message: "The 'isPremium' field must be a boolean" })
    isPremium?: boolean;

    @ApiProperty({
        description: 'ID of the category this article belongs to',
        example: 1,
    })
    @IsNotEmpty({ message: "The 'categoryId' field is required" })
    @IsInt({ message: "The 'categoryId' field must be an integer" })
    categoryId: number;

    @ApiPropertyOptional({
        description: 'Estimated reading time in minutes',
        default: 0,
        example: 5,
    })
    @IsOptional()
    @IsInt({ message: "The 'readingTime' field must be an integer" })
    @Min(0, { message: "The 'readingTime' field must be a non-negative integer" })
    readingTime?: number;
}

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
    @ApiPropertyOptional({
        description: 'IDs of authors to add to the article',
        type: [Number],
    })
    @IsOptional()
    @IsArray({ message: "The 'addAuthorIds' field must be an array of numbers" })
    @IsInt({ each: true, message: 'Each addAuthorId must be an integer' })
    addAuthorIds?: number[];

    @ApiPropertyOptional({
        description: 'IDs of authors to replace the current authors',
        type: [Number],
    })
    @IsOptional()
    @IsArray({ message: "The 'replaceAuthorIds' field must be an array of numbers" })
    @IsInt({ each: true, message: 'Each replaceAuthorId must be an integer' })
    replaceAuthorIds?: number[];

    @ApiPropertyOptional({
        description: 'Content objects to add to the article',
        type: [CreateArticleContentDto],
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @IsArray({ message: "The 'addContents' field must be an array of content objects" })
    @Type(() => CreateArticleContentDto)
    addContents?: CreateArticleContentDto[];

    @ApiPropertyOptional({
        description: 'Content objects to replace the current contents',
        type: [CreateArticleContentDto],
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @IsArray({ message: "The 'replaceContents' field must be an array of content objects" })
    @Type(() => CreateArticleContentDto)
    replaceContents?: CreateArticleContentDto[];
}

export class ArticleResponseDto extends OmitType(CreateArticleDto, ['contents', 'authorIds', 'categoryId'] as const) {
    @ApiProperty({ description: 'Unique identifier of the article', example: 1 })
    id: number;

    @ApiProperty({ description: 'Category information' })
    category: any;

    @ApiProperty({ description: 'Authors information', type: [Object] })
    authors: any[];

    @ApiProperty({ description: 'Content sections', type: [Object] })
    articleContent: any[];

    @ApiProperty({ description: 'Creation date', example: '2023-01-01T12:00:00Z' })
    creation_date: Date;

    @ApiProperty({ description: 'Last update date', example: '2023-01-02T12:00:00Z' })
    update_date: Date;
}

export class AddLikeDto {
    @ApiProperty({ description: 'ID of the user who likes the article', example: 1 })
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}

export class ReadUserArticleDto {
    @ApiProperty({ description: 'ID of the user who read the article', example: 1 })
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}

export class SaveUserArticleDto {
    @ApiProperty({ description: 'ID of the user who saved the article', example: 1 })
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}
