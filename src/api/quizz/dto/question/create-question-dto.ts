import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ManyToOne } from 'typeorm';
import { QuestionTypesEnum, Quizz } from '../../entities/quizz.entity';
import { CreateQuestionOptionDto } from '../questionOption/create-questionOption.dto';

export class CreateQuestionDto {
    @ApiProperty({
        description: 'The question',
        example: 'What is the capital of France?',
    })
    @IsNotEmpty()
    @IsString()
    question: string;

    @ApiProperty({
        description: 'The type of the question',
        example: 'MULTIPLE_CHOICE',
    })
    @IsEnum(QuestionTypesEnum)
    type: QuestionTypesEnum;

    @ApiProperty({
        description: 'The options id for the question',
        example: [1, 2, 3],
    })
    @IsNotEmpty()
    options: number[];

    @ApiProperty({
        description: 'The explanation for the question',
        example: 'The capital of France is Paris.',
    })
    @IsNotEmpty()
    @IsString()
    explanation: string;

    @ApiProperty({
        description: 'The quizz id for the question',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    quizzId: number;
}
