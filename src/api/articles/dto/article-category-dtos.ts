import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleCategoryDto {
    @ApiProperty({
        description: 'Title of the category',
        example: 'Investment',
    })
    @IsNotEmpty({ message: "The 'title' field is required" })
    @IsString()
    title: string;

    @ApiPropertyOptional({
        description: 'Description of the category',
        example: 'Articles about investment strategies and opportunities',
    })
    @IsOptional()
    @IsString({ message: "The 'description' field must be a string" })
    description?: string;

    @ApiProperty({
        description: 'Icon identifier for the category',
        example: 'chart-pie',
    })
    @IsNotEmpty({ message: "The 'icon' field is required" })
    @IsString()
    icon: string;

    @ApiPropertyOptional({
        description: 'IDs of articles in this category',
        type: [Number],
        example: [1, 2, 3],
    })
    @IsOptional()
    @IsArray({ message: "The 'articlesId' field must be an array" })
    articlesId?: number[];
}

export class UpdateArticleCategoryDto extends PartialType(CreateArticleCategoryDto) {}

export class ArticleCategoryResponseDto {
    @ApiProperty({ description: 'Unique identifier for the category', example: 1 })
    id: number;

    @ApiProperty({ description: 'Title of the category', example: 'Investment' })
    title: string;

    @ApiPropertyOptional({ description: 'Description of the category', example: 'Articles about investment' })
    description?: string;

    @ApiProperty({ description: 'Icon identifier for the category', example: 'chart-pie' })
    icon: string;

    @ApiProperty({ description: 'Articles in this category', type: [Object] })
    articles: any[];

    @ApiProperty({ description: 'Creation date', example: '2023-01-01T12:00:00Z' })
    creation_date: Date;

    @ApiProperty({ description: 'Last update date', example: '2023-01-02T12:00:00Z' })
    update_date: Date;
}
