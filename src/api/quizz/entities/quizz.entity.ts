import { ApiProperty } from '@nestjs/swagger';
import { Article } from 'src/api/articles/entities/article.entity';
import { Challenge } from 'src/api/challenges/entities/challenge.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';

export enum QuizzDifficultyEnum {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum QuestionTypesEnum {
    MULTIPLE = 'multiple',
    BOOLEAN = 'boolean',
    IMAGE = 'image',
}

// id: number;
// title: string;
// image: string;
// description: string;
// questions: QuestionType[];
// theme: ArticleCategoriesEnum;
// difficulty: QuizzDifficultyEnum;
// relatedArticles: ArticleType[];
@Entity()
export class Quizz {
    @ApiProperty({ description: 'Unique identifier of the quiz' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Title of the quiz' })
    @Column()
    title: string;

    @ApiProperty({ description: 'Image URL or path for the quiz' })
    @Column()
    image: string;

    @ApiProperty({ description: 'Description of the quiz' })
    @Column()
    description: string;

    @ApiProperty({ description: 'Questions in the quiz' })
    @OneToMany(
        () => Question,
        (question) => question.quizz,
        { cascade: true },
    )
    questions: Question[];

    @ApiProperty({ description: 'Theme of the quiz' })
    @Column()
    theme: string;

    @ApiProperty({ description: 'Difficulty level of the quiz' })
    @Column()
    difficulty: QuizzDifficultyEnum;

    @ManyToMany(
        () => Article,
        (article) => article.id,
    )
    @JoinTable()
    relatedArticles: Article[];

    @ManyToOne(
        () => Challenge,
        (challenge) => challenge.id,
        { eager: false },
    )
    challenge: Challenge;
}
