import { User } from '@src/api/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PinAuth {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column()
    userId: number;

    @Column()
    hashedPin: string;

    @Column({ default: 0 })
    failedAttempts: number;

    @Column()
    isLocked: boolean;

    @Column({ default: 3 })
    maxAttempts: number;

    @Column({ default: 6 })
    pinLength: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
