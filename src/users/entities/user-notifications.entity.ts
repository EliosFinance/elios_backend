import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserNotifications {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(
        () => User,
        (user) => user.notifications,
        { onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'userId' })
    //@Exclude()
    user: User;

    @Column({ default: true })
    accountSync: boolean;

    @Column({ default: true })
    budget: boolean;

    @Column({ default: true })
    expenses: boolean;

    @Column({ default: true })
    learn: boolean;

    @Column({ default: true })
    emails: boolean;

    @Column({ default: true })
    push: boolean;

    @Column({ default: true })
    friends: boolean;

    @Column({ default: true })
    challenges: boolean;

    @Column({ default: true })
    weeklyReport: boolean;

    @Column({ default: true })
    monthlyReport: boolean;
}
