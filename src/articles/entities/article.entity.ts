import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Article {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column('text')
    content: string;

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
}
