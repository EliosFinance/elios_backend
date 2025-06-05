import { ChallengeStateMachineConfigType } from '@src/types/challengeStepsTypes';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Enterprise } from '../../enterprises/entities/enterprise.entity';
import { UserToChallenge } from './usertochallenge.entity';

export enum CategoryChallenge {
    BUDGET = 'Budget',
    INVESTISSEMENT = 'Investissement',
    ECONOMIE = 'Economie',
    FINANCE = 'Finance',
    DEVELOPPEMENT = 'Developement',
    PERSONAL = 'Personal',
}

@Entity()
export class Challenge {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 255 })
    // Obligatoire
    title: string;

    @Column('text')
    // Obligatoire
    description: string;

    @Column()
    // Obligatoire
    image: string;

    @OneToMany(
        () => UserToChallenge,
        (userToChallenge) => userToChallenge.challenge,
    )
    userToChallenge: UserToChallenge[];

    @ManyToOne(
        () => Enterprise,
        (enterprise) => enterprise.challenge,
    )
    // Obligatoire
    enterprise: Enterprise;

    @Column({
        type: 'enum',
        enum: CategoryChallenge,
        default: CategoryChallenge.BUDGET,
    })
    // Obligatoire
    category: CategoryChallenge;

    @Column('json', { nullable: false })
    stateMachineConfig: ChallengeStateMachineConfigType;

    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}

export type ChallengeType = Omit<Challenge, 'stateMachineConfig'>;
