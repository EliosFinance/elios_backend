import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Challenge } from './challenge.entity';

export enum ChallengeStatus {
    DEFAULT = 'Default',
    START = 'Start',
    COMPLETED = 'Completed',
}

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

    @Column({
        type: 'enum',
        enum: ChallengeStatus,
        default: ChallengeStatus.DEFAULT,
    })
    status: ChallengeStatus;

    @Column('json', { nullable: true })
    stateMachineConfig: any;

    @Column('varchar', { length: 255, default: 'default' })
    currentState: string;

    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}
