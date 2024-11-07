import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, UpdateResult } from 'typeorm';
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
    ) {}

    async create(createArticleDto: CreateArticleDto): Promise<Article> {
        const { title, description, content, authorIds } = createArticleDto;

        const authors = await this.userRepository.findBy({ id: In(authorIds) });
        if (!authors || authors.length !== authorIds.length) {
            throw new NotFoundException('One or more authors not found');
        }

        const newArticle = this.articleRepository.create({
            title,
            description,
            content,
            authors,
        });

        return this.articleRepository.save(newArticle);
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
