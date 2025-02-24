import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateContentTypeDto } from './create-content-type.dto';

export enum TextUpdateMode {
    REPLACE = 'replace',
    ADD = 'add',
}

export class UpdateContentTypeDto extends PartialType(CreateContentTypeDto) {
    @IsOptional()
    @IsEnum(TextUpdateMode, { message: 'The updateMode must be either "replace" or "add".' })
    updateMode?: TextUpdateMode;

    @IsOptional()
    @IsString({ each: true, message: 'Each element in "text" must be a string.' })
    text?: string[];
}
