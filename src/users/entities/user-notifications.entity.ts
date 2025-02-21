import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserNotifications {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    accountSync: boolean;

    @Column({ default: false })
    budget: boolean;

    @Column({ default: false })
    expenses: boolean;

    @Column({ default: false })
    learn: boolean;

    @Column({ default: false })
    emails: boolean;

    @Column({ default: false })
    push: boolean;

    @Column({ default: false })
    friends: boolean;

    @Column({ default: false })
    challenges: boolean;

    @Column({ default: false })
    weeklyReport: boolean;

    @Column({ default: false })
    monthlyReport: boolean;

    @OneToOne(
        () => User,
        (user) => user.notifications,
        { onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'userId' })
    user: User;
}
