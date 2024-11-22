import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Article } from '../../articles/entities/article.entity';

@Entity()
export class ArticleCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({
        nullable: true,
    })
    description: string;

    @Column()
    icon: string;

    @OneToMany(
        () => Article,
        (article) => article.category,
        {
            cascade: ['remove'],
            onDelete: 'CASCADE',
        },
    )
    articles: Article[];

    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}
