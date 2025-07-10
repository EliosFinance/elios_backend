import { User } from '@src/api/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('two_factor_auth')
export class TwoFactorAuth {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    code: string;

    @Column({ default: false })
    isUsed: boolean;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    usedAt: Date;

    @Column({
        type: 'enum',
        enum: ['login', 'sensitive_action', 'account_recovery'],
        default: 'login',
    })
    purpose: string;

    @Column('json', { nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;
}
