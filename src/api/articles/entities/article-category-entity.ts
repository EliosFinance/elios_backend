import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity()
export class ArticleCategory {
    @ApiProperty({ description: 'Unique identifier of the category' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Title of the category' })
    @Column({ length: 100 })
    @Index({ unique: true })
    title: string;

    @ApiProperty({ description: 'Description of the category' })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({ description: 'Icon identifier for the category' })
    @Column()
    icon: string;

    @ApiProperty({ description: 'Articles in this category' })
    @OneToMany(
        () => Article,
        (article) => article.category,
        {
            cascade: ['update'],
            nullable: true,
        },
    )
    articles: Article[];

    @ApiProperty({ description: 'Creation date of the category' })
    @CreateDateColumn()
    creation_date: Date;

    @ApiProperty({ description: 'Last update date of the category' })
    @UpdateDateColumn()
    update_date: Date;

    /**
     * Helper method to get the count of articles in this category
     */
    get articleCount(): number {
        return this.articles?.length ?? 0;
    }

    /**
     * Helper method to check if this category has any articles
     */
    get hasArticles(): boolean {
        return this.articleCount > 0;
    }
}
