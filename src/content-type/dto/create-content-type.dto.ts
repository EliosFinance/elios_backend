import { IsArray, IsEnum, IsInt, IsOptional, ValidateNested } from 'class-validator';
import { ContentTypeCategory } from '../entities/content-type.entity';

export class CreateContentTypeDto {
    @IsEnum(ContentTypeCategory)
    type: ContentTypeCategory;

    @IsArray()
    @IsOptional()
    text: string[];

    @IsInt()
    cardId: number;
}
