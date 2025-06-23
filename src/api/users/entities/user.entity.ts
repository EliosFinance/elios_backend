import * as bcrypt from 'bcrypt';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import { ArticleCategory } from '../../articles/entities/article-category-entity';
import { ArticleContent } from '../../articles/entities/article-content-entity';
import { Article } from '../../articles/entities/article.entity';
import { Challenge } from '../../challenges/entities/challenge.entity';
import { UserToChallenge } from '../../challenges/entities/usertochallenge.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { UserNotifications } from './user-notifications.entity';

@Entity()
@Unique(['username', 'email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true }) // Nullable pour Google OAuth
    password: string;

    @Column({ unique: true, default: null })
    email: string;

    @Column({ nullable: true })
    powens_token: string;

    @Column({ nullable: true })
    powens_id: number;

    // Nouveaux champs pour le flux d'inscription unifié
    @Column({ default: false })
    emailVerified: boolean;

    @Column({ default: false })
    pinConfigured: boolean;

    @Column({ nullable: true })
    termsAcceptedAt: Date;

    @Column({ default: false })
    profileComplete: boolean;

    @Column({ type: 'enum', enum: ['email', 'google'], default: 'email' })
    provider: 'email' | 'google';

    @Column({ nullable: true })
    googleId: string;

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

    @OneToOne(
        () => UserNotifications,
        (notifications) => notifications.user,
        { cascade: true },
    )
    notifications: UserNotifications;

    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    // Nouvelles méthodes utiles
    isRegistrationComplete(): boolean {
        return this.emailVerified && this.pinConfigured && !!this.termsAcceptedAt && this.profileComplete;
    }

    getNextRegistrationStep(): string | null {
        if (!this.emailVerified && this.provider !== 'google') return 'email_verification';
        if (!this.profileComplete) return 'profile_completion';
        if (!this.pinConfigured) return 'pin_configuration';
        if (!this.termsAcceptedAt) return 'terms_acceptance';
        return null;
    }
}
