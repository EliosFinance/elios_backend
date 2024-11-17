import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, UpdateResult } from 'typeorm';
import { ArticleCategory } from '../article-category/entities/article-category.entity';
import { ArticleContent } from '../article-content/entities/article-content.entity';
import { User } from '../users/entities/user.entity';
import { AddLikeDto } from './dto/add-like.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ArticleCategory)
        private readonly articleCategoryRepository: Repository<ArticleCategory>,
        @InjectRepository(ArticleContent)
        private readonly articleContentRepository: Repository<ArticleContent>,
    ) {}

    async create(createArticleDto: CreateArticleDto): Promise<Article> {
        const { title, description, authorIds, thumbnail, isPremium, categoryId, readingTime, contents } =
            createArticleDto;
        let category = null;
        let authors = [];
        console.log('content', contents);
        if (authorIds && authorIds.length > 0) {
            authors = await this.userRepository.findBy({ id: In(authorIds) });
        }
        if (categoryId) {
            category = await this.articleCategoryRepository.findOneBy({ id: categoryId });
        }
        if (!authors || authors.length < 1 || authors.length !== authorIds.length) {
            throw new NotFoundException('One or more authors not found');
        }
        console.log('category', category);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const newArticle = this.articleRepository.create({
            title,
            description,
            authors,
            thumbnail,
            isPremium,
            category,
            readingTime,
        });

        const savedArticle = await this.articleRepository.save(newArticle);

        if (contents && contents.length > 0) {
            const articleContents = contents.map((contentData) => {
                const newContent = this.articleContentRepository.create({
                    ...contentData,
                    article: savedArticle,
                });
                return this.articleContentRepository.save(newContent);
            });

            await Promise.all(articleContents);
        }

        return savedArticle;
    }

    async findAll(): Promise<Article[]> {
        return this.articleRepository.find({ relations: ['authors', 'likes'] });
    }

    async findOne(id: number): Promise<Article> {
        const article = await this.articleRepository.findOne({
            where: { id: id },
            relations: { authors: true, likes: true },
        });
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        return article;
    }

    async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
        const article = await this.findOne(id);

        Object.assign(article, updateArticleDto);

        return this.articleRepository.save(article);
    }

    async remove(id: number): Promise<void> {
        const article = await this.findOne(id);
        await this.articleRepository.remove(article);
    }

    async addLike(articleId: number, addLikeDto: AddLikeDto): Promise<Article> {
        const article = await this.findOne(articleId);
        const user = await this.userRepository.findOne({ where: { id: addLikeDto.userId } });

        if (!user) {
            throw new NotFoundException(`User with ID ${addLikeDto.userId} not found`);
        }

        const alreadyLiked = article.likes.some((u) => u.id === user.id);
        if (!alreadyLiked) {
            article.likes.push(user);
        }

        return this.articleRepository.save(article);
    }

    async incrementViews(id: number): Promise<UpdateResult> {
        return this.articleRepository.increment({ id }, 'views', 1);
    }
}
