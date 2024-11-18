import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ArticleContent } from '../../article-content/entities/article-content.entity';

export enum ContentTypeCategory {
    TEXT = 'text',
    LIST = 'list',
    IMAGES = 'image',
    VIDEO = 'video',
    QUOTE = 'quote',
}

@Entity()
export class ContentType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ContentTypeCategory,
        default: ContentTypeCategory.TEXT,
    })
    type: ContentTypeCategory;

    @Column('text', {
        array: true,
        default: () => 'ARRAY[]::text[]',
    })
    text: string[];

    @ManyToOne(
        () => ArticleContent,
        (articleContent) => articleContent.contentType,
    )
    articleContent: ArticleContent;
}
