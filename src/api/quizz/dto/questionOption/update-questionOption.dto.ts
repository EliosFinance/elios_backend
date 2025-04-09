import { PartialType } from '@nestjs/swagger';
import { CreateQuestionOptionDto } from './create-questionOption.dto';

export class UpdateQuestionOptionDto extends PartialType(CreateQuestionOptionDto) {}
