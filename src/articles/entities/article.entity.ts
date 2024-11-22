import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleCategory } from '../../article-category/entities/article-category.entity';
import { ArticleContent } from '../../article-content/entities/article-content.entity';
import { CategoryChallenge } from '../../challenges/entities/challenge.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    // Obligatoire
    title: string;

    @Column('text')
    // Obligatoire
    description: string;

    @Column('boolean', { default: false })
    isPremium: boolean;

    @ManyToMany(
        () => User,
        (user) => user.articles,
        { cascade: true },
    )
    @JoinTable()
    authors: User[];
    // Obligatoire

    @ManyToMany(
        () => User,
        (user) => user.likedArticles,
        { cascade: true },
    )
    @JoinTable({
        name: 'articles_likes',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    likes: User[];

    @ManyToMany(
        () => User,
        (user) => user.readArticles,
        { cascade: true },
    )
    @JoinTable({
        name: 'articles_reads',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    reads: User[];

    @ManyToMany(
        () => User,
        (user) => user.savedArticles,
        {
            cascade: true,
        },
    )
    @JoinTable({
        name: 'articles_saved',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    saved: User[];

    @Column({
        type: 'int',
        nullable: false,
        default: 0,
    })
    // Obligatoire
    readingTime: number;

    @Column({
        default: 'lala',
    })
    // Obligatoire
    thumbnail: string;

    @ManyToOne(
        () => ArticleCategory,
        (articleCategory) => articleCategory.articles,
    )
    // Obligatoire
    category: ArticleCategory;

    @OneToMany(
        () => ArticleContent,
        (articleContent) => articleContent.article,
        {
            cascade: ['remove'],
            onDelete: 'CASCADE',
        },
    )
    articleContent: ArticleContent[];

    @CreateDateColumn()
    creation_date: Date;
}
