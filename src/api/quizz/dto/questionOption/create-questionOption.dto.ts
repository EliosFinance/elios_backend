import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateQuestionOptionDto {
    @ApiProperty({
        description: 'The option',
        example: 'Option A',
    })
    @IsNotEmpty()
    @IsString()
    option: string;

    @ApiProperty({
        description: 'Is this the correct answer ?',
        example: true,
    })
    @IsNotEmpty()
    @IsBoolean()
    isCorrect: boolean;

    // relation to the question
    @ApiProperty({
        description: 'The question id for the option',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    questionId: number;
}
