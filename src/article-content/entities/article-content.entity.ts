import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { ContentType } from '../../content-type/entities/content-type.entity';
import { User } from '../../users/entities/user.entity';

export enum ArticleContentType {
    PREVIEW = 'preview',
    SMALL_PREVIEW = 'small_preview',
    FULL = 'full',
    FULL_ROUNDED_IMAGE = 'full_rounded_image',
}

@Entity()
export class ArticleContent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    image: string;

    @Column()
    title: string;

    @ManyToMany(
        () => User,
        (user) => user.readArticleContent,
    )
    @JoinTable({
        name: 'articles_content_reads',
        joinColumn: { name: 'article_content_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    reads: User[];

    @ManyToMany(
        () => User,
        (user) => user.savedArticlesContent,
    )
    @JoinTable({
        name: 'articles_content_saved',
        joinColumn: { name: 'article_content_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    saved: User[];

    @OneToMany(
        () => ContentType,
        (contentType) => contentType.articleContent,
    )
    contentType: ContentType[];

    @Column({
        type: 'enum',
        enum: ArticleContentType,
        default: ArticleContentType.PREVIEW,
    })
    type: ArticleContentType;

    @ManyToOne(
        () => Article,
        (article) => article.articleContent,
    )
    article: Article;
}
