import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RewardType {
    EC = 'Ec',
    XP = 'Xp',
    Badge = 'badge',
}

@Entity()
export class Reward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 255 })
    title: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: RewardType,
        default: RewardType.EC,
    })
    rewardType: RewardType;

    @Column('int')
    value: number;

    @Column({ type: 'varchar', nullable: true })
    icon: string;
}
