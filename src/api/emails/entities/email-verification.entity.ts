import { User } from '@src/api/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('email_verifications')
export class EmailVerification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column({ unique: true })
    token: string;

    @Column()
    email: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    verifiedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
