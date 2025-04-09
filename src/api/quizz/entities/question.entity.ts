import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionOption } from './question-option.entity';
import { QuestionTypesEnum, Quizz } from './quizz.entity';

@Entity()
export class Question {
    @ApiProperty({ description: 'Unique identifier of the question' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Type of the question' })
    @Column()
    type: QuestionTypesEnum;

    @ApiProperty({ description: 'Question text' })
    @Column()
    question: string;

    @OneToMany(
        () => QuestionOption,
        (option) => option.question,
        { cascade: true },
    )
    options: QuestionOption[];

    @ApiProperty({ description: 'Explanation for the question' })
    @Column()
    explanation: string;

    @ManyToOne(
        () => Quizz,
        (quizz) => quizz.questions,
        { onDelete: 'CASCADE' },
    )
    quizz: Quizz;
}
