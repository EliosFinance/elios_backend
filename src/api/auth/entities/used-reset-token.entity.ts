import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsedResetToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    tokenHash: string;

    @Column()
    userId: number;

    @CreateDateColumn()
    usedAt: Date;
}
