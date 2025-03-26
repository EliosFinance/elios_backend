import { User } from '@src/api/users/entities/user.entity';
import { ChallengeEventEnum, ChallengeStepsEnum } from '@src/types/ChallengeStepsTypes';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Challenge } from './challenge.entity';

@Entity()
export class UserToChallenge {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => Challenge,
        (challenge) => challenge.userToChallenge,
    )
    @JoinColumn({ name: 'challengeId' })
    challenge: Challenge;

    @ManyToOne(
        () => User,
        (user) => user.userToChallenge,
    )
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column('varchar', { length: 255, default: 'default' })
    currentState: string | null;

    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}
