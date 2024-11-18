import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { ContentTypeCategory } from '../entities/content-type.entity';

export class CreateContentTypeDto {
    @IsEnum(ContentTypeCategory)
    type: ContentTypeCategory;

    @IsArray()
    @IsOptional()
    text: string[];

    @IsInt()
    @IsNotEmpty({ message: 'The articleContentId field cannot by empty.' })
    articleContentId: number;
}
