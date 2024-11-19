import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateArticleCategoryDto {
    @IsNotEmpty({ message: "The 'title' field is required" })
    @IsString()
    title: string;

    @IsNotEmpty({ message: "The 'description' field is required" })
    @IsString()
    description: string;

    @IsNotEmpty({ message: "The 'type' field is required" })
    @IsString()
    icon: string;

    @IsOptional()
    @IsArray({ message: "The 'type' field must be an array" })
    articlesId: number[];
}
