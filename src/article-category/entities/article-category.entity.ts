import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';

@Entity()
export class ArticleCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    // Obligatoire
    title: string;

    @Column()
    // Optionel
    description: string;

    @Column()
    // Obligatoire
    icon: string;

    @OneToMany(
        () => Article,
        (article) => article.category,
    )
    articles: Article[];

    @CreateDateColumn()
    creation_date: Date;
}
