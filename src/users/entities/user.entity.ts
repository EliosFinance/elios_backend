import * as bcrypt from 'bcrypt';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { ArticleCategory } from '../../article-category/entities/article-category.entity';
import { ArticleContent } from '../../article-content/entities/article-content.entity';
import { Article } from '../../articles/entities/article.entity';
import { Challenge } from '../../challenges/entities/challenge.entity';
import { UserToChallenge } from '../../challenges/entities/usertochallenge.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity()
@Unique(['username', 'email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true, default: null })
    email: string;

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

    @OneToMany(
        () => UserToChallenge,
        (userToChallenge) => userToChallenge.user,
    )
    userToChallenge: UserToChallenge[];

    @ManyToMany(
        () => Article,
        (article) => article.reads,
    )
    readArticles: Article[];

    @ManyToMany(
        () => ArticleContent,
        (articleContent) => articleContent.reads,
    )
    readArticleContent: ArticleContent[];

    @ManyToMany(
        () => Article,
        (article) => article.saved,
    )
    savedArticles: Article[];

    @ManyToMany(
        () => ArticleContent,
        (articleContent) => articleContent.saved,
    )
    savedArticlesContent: Article[];

    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}
