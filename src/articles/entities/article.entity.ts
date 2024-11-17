import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArticleCategory } from '../../article-category/entities/article-category.entity';
import { ArticleContent } from '../../article-content/entities/article-content.entity';
import { CategoryChallenge } from '../../challenges/entities/challenge.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('boolean', { default: false })
    isPremium: boolean;

    @Column('int', { default: 0 })
    views: number;

    @ManyToMany(
        () => User,
        (user) => user.articles,
    )
    @JoinTable()
    authors: User[];

    @ManyToMany(
        () => User,
        (user) => user.likedArticles,
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
    readingTime: number;

    @Column({
        default: 'lala',
    })
    thumbnail: string;

    @ManyToOne(
        () => ArticleCategory,
        (articleCategory) => articleCategory.articles,
    )
    category: ArticleCategory;

    @OneToMany(
        () => ArticleContent,
        (articleContent) => articleContent.article,
    )
    articleContent: ArticleContent[];
}
