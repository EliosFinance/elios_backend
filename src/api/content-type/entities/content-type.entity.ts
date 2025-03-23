import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ArticleContent } from '../../articles/entities/article-content-entity';

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
        { onDelete: 'CASCADE' },
    )
    articleContent: ArticleContent;

    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}
