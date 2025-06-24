import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    powens_id: string;

    @Column()
    id_account: number;

    @Column()
    date: string;

    @Column('numeric', { nullable: true })
    value: number;

    @Column('numeric', { nullable: true })
    gross_value: number;

    @Column()
    type: string;

    @Column()
    original_wording: string;

    @Column()
    simplified_wording: string;

    @Column({ nullable: true })
    wording: string;

    @Column('text', { array: true, nullable: true })
    categories: string[];

    @Column()
    date_scraped: string;

    @ManyToOne(
        () => User,
        (user) => user.transactions,
    )
    user: User;

    @CreateDateColumn()
    date_recorded: Date;
}
