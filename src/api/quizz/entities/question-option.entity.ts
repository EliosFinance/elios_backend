import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Question } from './question.entity';

@Entity()
export class QuestionOption {
    @ApiProperty({ description: '1' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'The option' })
    @Column()
    option: string;

    @ApiProperty({ description: 'Is this the correct answer ?' })
    @Column()
    isCorrect: boolean;

    @ManyToOne(
        () => Question,
        (question) => question.options,
        { onDelete: 'CASCADE' },
    )
    question: Question;
}
