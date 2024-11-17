import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';

@Entity()
export class ArticleCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    icon: string;

    @OneToMany(
        () => Article,
        (article) => article.category,
    )
    articles: Article[];
}
