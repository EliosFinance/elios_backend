import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';
import { ArticleCategory } from './entities/article-category.entity';

@Injectable()
export class ArticleCategoryService {
    constructor(
        @InjectRepository(ArticleCategory)
        private readonly articleCategoryRepository: Repository<ArticleCategory>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
    ) {}

    async create(createArticleCategoryDto: CreateArticleCategoryDto) {
        const { title, description, icon, articlesId } = createArticleCategoryDto;

        let articles = [];

        if (articlesId && articlesId.length > 0) {
            articles = await this.articleRepository.findBy({ id: In(articlesId) });
        }

        const newCategory = this.articleCategoryRepository.create({
            title,
            description,
            icon,
            articles: articles.length > 0 ? articles : null,
        });

        return this.articleCategoryRepository.save(newCategory);
    }

    async findAll() {
        return this.articleCategoryRepository.find({ relations: ['articles'] });
    }

    async findOne(id: number) {
        const category = await this.articleCategoryRepository.findOne({
            where: { id: id },
            relations: ['articles'],
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async update(id: number, updateArticleCategoryDto: UpdateArticleCategoryDto) {
        const category = await this.findOne(id);

        Object.assign(category, updateArticleCategoryDto);

        return this.articleCategoryRepository.save(category);
    }

    async remove(id: number) {
        const category = await this.findOne(id);
        await this.articleCategoryRepository.remove(category);
    }
}
