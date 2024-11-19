import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ContentTypeCategory } from '../entities/content-type.entity';

export class CreateContentTypeDto {
    @IsEnum(ContentTypeCategory, { message: 'The "type" field must be a valid ContentTypeCategory value.' })
    @IsNotEmpty({ message: 'The "type" field must not be empty.' })
    type: ContentTypeCategory;

    @IsArray({ message: 'The "text" field must be an array of strings.' })
    @IsString({ each: true, message: 'Each element in "text" must be a string.' })
    @IsNotEmpty({ message: "The 'text' field is required" })
    text: string[];

    @IsInt({ message: "'The articleContentId field must be an integer.'" })
    @IsOptional()
    articleContentId: number;
}
