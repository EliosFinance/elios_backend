import { ApiProperty } from '@nestjs/swagger';
import { ArticleCategoriesEnum } from '@src/seed/seed-articles';
import { IsNotEmpty, IsString } from 'class-validator';
import { QuizzDifficultyEnum } from '../../entities/quizz.entity';

export class CreateQuizzDto {
    @ApiProperty({
        description: 'Title of the quiz',
        example: 'General Knowledge Quiz',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Image URL or path for the quiz',
        example: 'https://example.com/image.jpg',
    })
    @IsNotEmpty()
    @IsString()
    image: string;

    @ApiProperty({
        description: 'Description of the quiz',
        example: 'A quiz to test your general knowledge.',
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Theme of the quiz',
        example: 'General Knowledge',
    })
    @IsNotEmpty()
    @IsString()
    theme: ArticleCategoriesEnum;

    @ApiProperty({
        description: 'Difficulty level of the quiz',
        example: 'easy',
    })
    @IsNotEmpty()
    @IsString()
    difficulty: QuizzDifficultyEnum;

    @ApiProperty({
        description: 'Related articles for the quiz',
        example: [1, 2, 3],
    })
    @IsNotEmpty()
    relatedArticles: number[];

    @ApiProperty({
        description: 'ID of the challenge associated with the quiz',
        example: 1,
    })
    @IsNotEmpty()
    challengeId: number;
}
