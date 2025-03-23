import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateArticleCategoryDto } from '../dto/article-category-dtos';
import { UpdateArticleCategoryDto } from '../dto/article-category-dtos';
import { ArticleCategory } from '../entities/article-category-entity';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticleCategoryService {
    private readonly logger = new Logger(ArticleCategoryService.name);

    constructor(
        @InjectRepository(ArticleCategory)
        private readonly articleCategoryRepository: Repository<ArticleCategory>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
    ) {}

    /**
     * Create a new article category
     */
    async create(createArticleCategoryDto: CreateArticleCategoryDto): Promise<ArticleCategory> {
        try {
            const { title, description, icon, articlesId } = createArticleCategoryDto;

            // Find associated articles if provided
            let articles = [];
            if (articlesId && articlesId.length > 0) {
                articles = await this.articleRepository.findBy({ id: In(articlesId) });

                // Check if all specified articles exist
                if (articles.length !== articlesId.length) {
                    const foundIds = articles.map((article) => article.id);
                    const missingIds = articlesId.filter((id) => !foundIds.includes(id));

                    throw new BadRequestException(`Articles with IDs ${missingIds.join(', ')} were not found`);
                }
            }

            // Create new category entity
            const newCategory = this.articleCategoryRepository.create({
                title,
                description,
                icon,
                articles: articles.length > 0 ? articles : [],
            });

            // Save to database
            return await this.articleCategoryRepository.save(newCategory);
        } catch (error) {
            this.logger.error(`Failed to create article category: ${error.message}`, error.stack);

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException('Failed to create article category: ' + error.message);
        }
    }

    /**
     * Get all article categories with their articles
     */
    async findAll(): Promise<ArticleCategory[]> {
        try {
            return await this.articleCategoryRepository.find({
                relations: ['articles'],
                order: {
                    title: 'ASC',
                },
            });
        } catch (error) {
            this.logger.error(`Failed to find all article categories: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to retrieve article categories');
        }
    }

    /**
     * Get a specific article category by ID
     */
    async findOne(id: number): Promise<ArticleCategory> {
        try {
            const category = await this.articleCategoryRepository.findOne({
                where: { id: id },
                relations: ['articles'],
            });

            if (!category) {
                throw new NotFoundException(`Category with ID ${id} not found`);
            }

            return category;
        } catch (error) {
            this.logger.error(`Failed to find article category ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to retrieve article category with ID ${id}`);
        }
    }

    /**
     * Update an existing article category
     */
    async update(id: number, updateArticleCategoryDto: UpdateArticleCategoryDto): Promise<ArticleCategory> {
        try {
            // Find the category first to ensure it exists
            const category = await this.findOne(id);

            // If articlesId is provided, update article associations
            if (updateArticleCategoryDto.articlesId) {
                const articles = await this.articleRepository.findBy({
                    id: In(updateArticleCategoryDto.articlesId),
                });

                // Check if all specified articles exist
                if (articles.length !== updateArticleCategoryDto.articlesId.length) {
                    const foundIds = articles.map((article) => article.id);
                    const missingIds = updateArticleCategoryDto.articlesId.filter((id) => !foundIds.includes(id));

                    throw new BadRequestException(`Articles with IDs ${missingIds.join(', ')} were not found`);
                }

                category.articles = articles;

                // Remove articlesId from the DTO as it will be handled separately
                delete updateArticleCategoryDto.articlesId;
            }

            // Update basic properties
            Object.assign(category, updateArticleCategoryDto);

            // Save to database
            return await this.articleCategoryRepository.save(category);
        } catch (error) {
            this.logger.error(`Failed to update article category ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException(`Failed to update article category with ID ${id}`);
        }
    }

    /**
     * Remove an article category
     */
    async remove(id: number): Promise<void> {
        try {
            const category = await this.findOne(id);
            await this.articleCategoryRepository.remove(category);
        } catch (error) {
            this.logger.error(`Failed to remove article category ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to remove article category with ID ${id}`);
        }
    }
}
