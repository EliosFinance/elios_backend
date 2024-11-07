import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Enterprise } from '../../enterprises/entities/enterprise.entity';
import { User } from '../../users/entities/user.entity';

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

    @ManyToMany(
        () => User,
        (user) => user.challenges,
    )
    @JoinTable({
        name: 'challenges_users',
        joinColumn: { name: 'challenge_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    users: User[];
}
