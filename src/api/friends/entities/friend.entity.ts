import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('friends')
export class Friend {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    fromUser: User;

    @ManyToOne(() => User, { eager: true })
    toUser: User;

    @Column({ type: 'enum', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' })
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: false })
    isParrainage: boolean;
}
