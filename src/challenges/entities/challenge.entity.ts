import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Enterprise } from '../../enterprises/entities/enterprise.entity';
import { User } from '../../users/entities/user.entity';
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
    title: string;

    @Column('text')
    description: string;

    @Column()
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
    enterprise: Enterprise;

    @Column({
        type: 'enum',
        enum: CategoryChallenge,
        default: CategoryChallenge.BUDGET,
    })
    category: CategoryChallenge;
}
