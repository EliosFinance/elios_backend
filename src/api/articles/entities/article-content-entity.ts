import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ContentType } from '../../content-type/entities/content-type.entity';
import { User } from '../../users/entities/user.entity';
import { Article } from './article.entity';

export enum ArticleContentType {
    PREVIEW = 'preview',
    SMALL_PREVIEW = 'small_preview',
    FULL = 'full',
    FULL_ROUNDED_IMAGE = 'full_rounded_image',
}

@Entity()
export class ArticleContent {
    @ApiProperty({ description: 'Unique identifier of the content section' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'URL of the content image' })
    @Column()
    image: string;

    @ApiProperty({ description: 'Title of the content section' })
    @Column()
    title: string;

    @ApiProperty({ description: 'Users who have read this content section' })
    @ManyToMany(
        () => User,
        (user) => user.readArticleContent,
    )
    @JoinTable({
        name: 'article_content_reads',
        joinColumn: { name: 'article_content_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    reads: User[];

    @ApiProperty({ description: 'Users who have saved this content section' })
    @ManyToMany(
        () => User,
        (user) => user.savedArticlesContent,
    )
    @JoinTable({
        name: 'article_content_saved',
        joinColumn: { name: 'article_content_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    saved: User[];

    @ApiProperty({ description: 'Content types that make up this section' })
    @OneToMany(
        () => ContentType,
        (contentType) => contentType.articleContent,
        {
            cascade: true,
            eager: true,
        },
    )
    contentType: ContentType[];

    @ApiProperty({
        description: 'Display type of the content',
        enum: ArticleContentType,
        default: ArticleContentType.PREVIEW,
    })
    @Column({
        type: 'enum',
        enum: ArticleContentType,
        default: ArticleContentType.PREVIEW,
    })
    type: ArticleContentType;

    @ApiProperty({ description: 'Article this content belongs to' })
    @ManyToOne(
        () => Article,
        (article) => article.articleContent,
        {
            onDelete: 'CASCADE',
            nullable: false,
        },
    )
    @JoinColumn({ name: 'article_id' })
    article: Article;

    @ApiProperty({ description: 'Creation date of the content section' })
    @CreateDateColumn()
    creation_date: Date;

    @ApiProperty({ description: 'Last update date of the content section' })
    @UpdateDateColumn()
    update_date: Date;

    /**
     * Helper method to check if a user has read this content section
     */
    isReadByUser(userId: number): boolean {
        return this.reads?.some((user) => user.id === userId) ?? false;
    }

    /**
     * Helper method to check if a user has saved this content section
     */
    isSavedByUser(userId: number): boolean {
        return this.saved?.some((user) => user.id === userId) ?? false;
    }

    /**
     * Helper method to get all text content from content types
     */
    get allText(): string[] {
        if (!this.contentType) return [];

        return this.contentType.reduce((acc, ct) => {
            if (ct.text && ct.text.length > 0) {
                return [...acc, ...ct.text];
            }
            return acc;
        }, []);
    }
}
