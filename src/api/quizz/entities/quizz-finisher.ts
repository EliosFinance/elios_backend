import { User } from '@src/api/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Quizz } from './quizz.entity';

@Entity()
export class QuizzFinisher {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => Quizz,
        (quizz) => quizz.finishers,
    )
    quizz: Quizz;

    @ManyToOne(() => User)
    user: User;

    @Column('int', { default: 0 })
    lastScore: number;
}
