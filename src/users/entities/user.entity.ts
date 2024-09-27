import * as bcrypt from 'bcrypt';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    powens_token: string;

    @OneToMany(
        () => Transaction,
        (transaction) => transaction.user,
    )
    transactions: Transaction[];

    @ManyToMany(
        () => User,
        (user) => user.friends,
    )
    @JoinTable({
        name: 'user_friends',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'friend_id',
            referencedColumnName: 'id',
        },
    })
    friends: User[];

    @ManyToMany(
        () => Article,
        (article) => article.authors,
    )
    articles: Article[];

    @ManyToMany(
        () => Article,
        (article) => article.likes,
    )
    likedArticles: Article[];

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}
