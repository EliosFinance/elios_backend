import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ArticleCategory } from './article-category-entity';
import { ArticleContent } from './article-content-entity';

@Entity()
export class Article {
    @ApiProperty({ description: 'Unique identifier of the article' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Title of the article' })
    @Column()
    @Index({ fulltext: true })
    title: string;

    @ApiProperty({ description: 'Description of the article' })
    @Column('text')
    description: string;

    @ApiProperty({ description: 'Whether the article is premium content', default: false })
    @Column('boolean', { default: false })
    isPremium: boolean;

    @ApiProperty({ description: 'Authors of the article' })
    @ManyToMany(
        () => User,
        (user) => user.articles,
        {
            cascade: true,
            onDelete: 'CASCADE',
            eager: false,
        },
    )
    @JoinTable({
        name: 'article_authors',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    authors: User[];

    @ApiProperty({ description: 'Users who liked the article' })
    @ManyToMany(
        () => User,
        (user) => user.likedArticles,
        { cascade: true },
    )
    @JoinTable({
        name: 'article_likes',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    likes: User[];

    @ApiProperty({ description: 'Users who have read the article' })
    @ManyToMany(
        () => User,
        (user) => user.readArticles,
        { cascade: true },
    )
    @JoinTable({
        name: 'article_reads',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    reads: User[];

    @ApiProperty({ description: 'Users who saved the article' })
    @ManyToMany(
        () => User,
        (user) => user.savedArticles,
        { cascade: true },
    )
    @JoinTable({
        name: 'article_saved',
        joinColumn: { name: 'article_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    saved: User[];

    @ApiProperty({ description: 'Estimated reading time in minutes' })
    @Column({
        type: 'int',
        nullable: false,
        default: 0,
    })
    readingTime: number;

    @ApiProperty({ description: 'View count of the article' })
    @Column({
        type: 'int',
        nullable: false,
        default: 0,
    })
    views: number;

    @ApiProperty({ description: 'URL of the article thumbnail image' })
    @Column()
    thumbnail: string;

    @ApiProperty({ description: 'Category of the article' })
    @ManyToOne(
        () => ArticleCategory,
        (articleCategory) => articleCategory.articles,
        { onDelete: 'SET NULL' },
    )
    @JoinColumn({ name: 'category_id' })
    category: ArticleCategory;

    @ApiProperty({ description: 'Content sections of the article' })
    @OneToMany(
        () => ArticleContent,
        (articleContent) => articleContent.article,
        {
            cascade: true,
            onDelete: 'CASCADE',
        },
    )
    articleContent: ArticleContent[];

    @ApiProperty({ description: 'Creation date of the article' })
    @CreateDateColumn()
    creation_date: Date;

    @ApiProperty({ description: 'Last update date of the article' })
    @UpdateDateColumn()
    update_date: Date;

    /**
     * Helper method to check if a user has read this article
     */
    isReadByUser(userId: number): boolean {
        return this.reads?.some((user) => user.id === userId) ?? false;
    }

    /**
     * Helper method to check if a user has liked this article
     */
    isLikedByUser(userId: number): boolean {
        return this.likes?.some((user) => user.id === userId) ?? false;
    }

    /**
     * Helper method to check if a user has saved this article
     */
    isSavedByUser(userId: number): boolean {
        return this.saved?.some((user) => user.id === userId) ?? false;
    }
}
