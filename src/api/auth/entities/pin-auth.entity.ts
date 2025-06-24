import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

    @Column({ nullable: true })
    lastVerifiedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
