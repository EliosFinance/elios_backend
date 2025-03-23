import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateContentTypeDto } from '../../content-type/dto/create-content-type.dto';
import { ArticleContentType } from '../entities/article-content-entity';

export class CreateArticleContentDto {
    @ApiProperty({
        description: 'URL of the content image',
        example: 'https://example.com/content-image.jpg',
    })
    @IsNotEmpty({ message: "The 'image' field is required" })
    @IsString()
    image: string;

    @ApiProperty({
        description: 'Title of the content section',
        example: 'Understanding Investment Options',
    })
    @IsNotEmpty({ message: "The 'title' field is required" })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Type of the content display',
        enum: ArticleContentType,
        example: ArticleContentType.FULL,
    })
    @IsNotEmpty({ message: "The 'type' field is required" })
    @IsEnum(ArticleContentType, { message: "The 'type' field must be a valid ArticleContentType value" })
    type: ArticleContentType;

    @ApiPropertyOptional({
        description: 'IDs of users who have read this content',
        type: [Number],
        example: [1, 2, 3],
    })
    @IsOptional()
    @IsArray({ message: "The 'readsUserId' field must be an array" })
    readsUserId?: number[];

    @ApiPropertyOptional({
        description: 'IDs of users who have saved this content',
        type: [Number],
        example: [1, 4],
    })
    @IsOptional()
    @IsArray({ message: "The 'savedUserId' field must be an array" })
    savedUserId?: number[];

    @ApiProperty({
        description: 'Content type elements that make up this content section',
        type: [CreateContentTypeDto],
    })
    @IsNotEmpty({ message: "The 'contentType' field is required" })
    @IsArray({ message: 'The "contentType" field must be an array of elements' })
    @ValidateNested({ each: true })
    @Type(() => CreateContentTypeDto)
    contentType: CreateContentTypeDto[];

    @ApiPropertyOptional({
        description: 'ID of the article this content belongs to',
        example: 1,
    })
    @IsOptional()
    @IsInt({ message: "The 'articleId' field must be an integer" })
    articleId?: number;
}

export enum UpdateMode {
    REPLACE = 'replace',
    ADD = 'add',
}

export class UpdateArticleContentDto extends PartialType(CreateArticleContentDto) {
    @ApiPropertyOptional({
        description: 'Update mode for content types',
        enum: UpdateMode,
        default: UpdateMode.ADD,
        example: UpdateMode.REPLACE,
    })
    @IsOptional()
    @IsEnum(UpdateMode, { message: "The 'updateMode' field must be either 'replace' or 'add'" })
    updateMode?: UpdateMode;
}

export class ReadUserDto {
    @ApiProperty({
        description: 'ID of the user who read the content',
        example: 1,
    })
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}

export class SaveUserDto {
    @ApiProperty({
        description: 'ID of the user who saved the content',
        example: 1,
    })
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}
