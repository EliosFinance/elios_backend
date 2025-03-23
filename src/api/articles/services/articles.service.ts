import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository, UpdateResult } from 'typeorm';
import { ContentType } from '../../content-type/entities/content-type.entity';
import { User } from '../../users/entities/user.entity';
import { CreateArticleContentDto } from '../dto/article-content-dtos';
import { AddLikeDto, ReadUserArticleDto, SaveUserArticleDto } from '../dto/article-dtos';
import { CreateArticleDto } from '../dto/article-dtos';
import { UpdateArticleDto } from '../dto/article-dtos';
import { ArticleCategory } from '../entities/article-category-entity';
import { ArticleContent } from '../entities/article-content-entity';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticlesService {
    private readonly logger = new Logger(ArticlesService.name);

    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ArticleCategory)
        private readonly articleCategoryRepository: Repository<ArticleCategory>,
        @InjectRepository(ArticleContent)
        private readonly articleContentRepository: Repository<ArticleContent>,
        @InjectRepository(ContentType)
        private readonly contentTypeRepository: Repository<ContentType>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Create a new article with its content
     */
    async create(createArticleDto: CreateArticleDto): Promise<Article> {
        const { title, description, authorIds, thumbnail, isPremium, categoryId, readingTime, contents } =
            createArticleDto;

        try {
            return await this.dataSource.transaction(async (manager) => {
                let authors = [];
                let category = null;
                const errors: string[] = [];

                // Validate authors
                authors = await manager.find(User, { where: { id: In(authorIds) } });
                const missingAuthors = authorIds.filter((id) => !authors.some((author) => author.id === id));
                if (missingAuthors.length > 0) {
                    errors.push(`The following author IDs were not found: ${missingAuthors.join(', ')}`);
                }

                // Validate category
                try {
                    category = await manager.findOneOrFail(ArticleCategory, { where: { id: categoryId } });
                } catch (error) {
                    errors.push(`The category with ID ${categoryId} was not found.`);
                }

                if (errors.length > 0) {
                    throw new BadRequestException({
                        message: 'Validation failed for one or more fields.',
                        errors: errors,
                    });
                }

                // Create the article
                const newArticle = manager.create(Article, {
                    title,
                    description,
                    authors,
                    thumbnail,
                    isPremium: isPremium ?? false,
                    category,
                    readingTime: readingTime ?? 0,
                });

                const savedArticle = await manager.save(Article, newArticle);

                // Create article content sections
                if (contents && contents.length > 0) {
                    for (const contentData of contents) {
                        const { contentType, ...articleContentData } = contentData;

                        // Create article content
                        const newArticleContent = manager.create(ArticleContent, {
                            ...articleContentData,
                            article: savedArticle,
                        });

                        const savedArticleContent = await manager.save(ArticleContent, newArticleContent);

                        // Create content types for this article content
                        if (contentType && contentType.length > 0) {
                            const contentTypes = contentType.map((contentTypeData) => {
                                return manager.create(ContentType, {
                                    ...contentTypeData,
                                    articleContent: savedArticleContent,
                                });
                            });

                            await manager.save(ContentType, contentTypes);
                        }
                    }
                }

                // Load the complete article with relations
                return await manager.findOne(Article, {
                    where: { id: savedArticle.id },
                    relations: {
                        authors: true,
                        category: true,
                        articleContent: {
                            contentType: true,
                        },
                    },
                });
            });
        } catch (error) {
            this.logger.error(`Failed to create article: ${error.message}`, error.stack);

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException(`Failed to create article: ${error.message}`);
        }
    }

    /**
     * Get trending articles based on read count
     */
    async findTrending(): Promise<Article[]> {
        try {
            // Find IDs of articles with the most reads
            const trendingArticles = await this.articleRepository
                .createQueryBuilder('article')
                .leftJoin('article.reads', 'reads')
                .select(['article.id'])
                .addSelect('COUNT(reads.id)', 'read_count')
                .groupBy('article.id')
                .orderBy('read_count', 'DESC')
                .limit(10)
                .getRawMany();

            // Get article IDs from the query result
            const articleIds = trendingArticles.map((a) => a.article_id);
            if (articleIds.length === 0) return [];

            // Load the complete articles with relations
            return await this.articleRepository.find({
                where: { id: In(articleIds) },
                relations: ['authors', 'likes', 'reads', 'saved', 'articleContent'],
            });
        } catch (error) {
            this.logger.error(`Failed to find trending articles: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to retrieve trending articles');
        }
    }

    /**
     * Get articles read by a specific user
     */
    async userReads(userId: number): Promise<Article[]> {
        try {
            return await this.articleRepository.find({
                where: { reads: { id: userId } },
                relations: ['authors', 'likes', 'reads', 'saved', 'articleContent'],
            });
        } catch (error) {
            this.logger.error(`Failed to find articles read by user ${userId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to retrieve articles read by user ID ${userId}`);
        }
    }

    /**
     * Get articles liked by a specific user
     */
    async userLikes(userId: number): Promise<Article[]> {
        try {
            return await this.articleRepository.find({
                where: { likes: { id: userId } },
                relations: ['authors', 'likes', 'reads', 'saved', 'articleContent'],
            });
        } catch (error) {
            this.logger.error(`Failed to find articles liked by user ${userId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to retrieve articles liked by user ID ${userId}`);
        }
    }

    /**
     * Get all articles with their full relations
     */
    async findAll(): Promise<Article[]> {
        try {
            return await this.articleRepository.find({
                relations: ['authors', 'likes', 'reads', 'saved', 'articleContent', 'category'],
            });
        } catch (error) {
            this.logger.error(`Failed to find all articles: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to retrieve articles');
        }
    }

    /**
     * Get a specific article by ID with all its relations
     */
    async findOne(id: number): Promise<Article> {
        try {
            const article = await this.articleRepository.findOne({
                where: { id: id },
                relations: [
                    'category',
                    'authors',
                    'likes',
                    'reads',
                    'saved',
                    'articleContent',
                    'articleContent.contentType',
                    'articleContent.reads',
                    'articleContent.saved',
                ],
            });

            if (!article) {
                throw new NotFoundException(`Article with ID ${id} not found`);
            }

            return article;
        } catch (error) {
            this.logger.error(`Failed to find article ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to retrieve article with ID ${id}`);
        }
    }

    /**
     * Update an article
     */
    async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
        try {
            const { categoryId, replaceAuthorIds, addAuthorIds, addContents, replaceContents, ...otherUpdates } =
                updateArticleDto;

            // Find the article first to ensure it exists
            const article = await this.findOne(id);

            // Update basic properties
            Object.assign(article, otherUpdates);

            // Update category if provided
            if (categoryId) {
                const category = await this.articleCategoryRepository.findOne({ where: { id: categoryId } });
                if (!category) {
                    throw new NotFoundException(`Category with ID ${categoryId} not found`);
                }
                article.category = category;
            }

            // Update authors if provided
            if (replaceAuthorIds) {
                // Replace all authors with the new ones
                const authors = await this.userRepository.find({ where: { id: In(replaceAuthorIds) } });

                // Validate that all author IDs exist
                if (authors.length !== replaceAuthorIds.length) {
                    const foundIds = authors.map((author) => author.id);
                    const missingIds = replaceAuthorIds.filter((id) => !foundIds.includes(id));
                    throw new BadRequestException(`Authors with IDs ${missingIds.join(', ')} were not found`);
                }

                article.authors = authors;
            } else if (addAuthorIds) {
                // Add new authors to existing ones
                const authorsToAdd = await this.userRepository.find({ where: { id: In(addAuthorIds) } });

                // Validate that all author IDs exist
                if (authorsToAdd.length !== addAuthorIds.length) {
                    const foundIds = authorsToAdd.map((author) => author.id);
                    const missingIds = addAuthorIds.filter((id) => !foundIds.includes(id));
                    throw new BadRequestException(`Authors with IDs ${missingIds.join(', ')} were not found`);
                }

                // Filter out duplicates
                const existingAuthorIds = article.authors.map((author) => author.id);
                const uniqueAuthorsToAdd = authorsToAdd.filter((author) => !existingAuthorIds.includes(author.id));

                article.authors = [...article.authors, ...uniqueAuthorsToAdd];
            }

            // Update article contents if provided
            if (replaceContents) {
                await this.replaceArticleContents(article, replaceContents);
            } else if (addContents) {
                await this.addArticleContents(article, addContents);
            }

            // Save the updated article
            const updatedArticle = await this.articleRepository.save(article);

            // Ensure article is not included in nested relations to avoid circular references
            updatedArticle.articleContent.forEach((content) => {
                delete content.article;
            });

            return updatedArticle;
        } catch (error) {
            this.logger.error(`Failed to update article ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException(`Failed to update article with ID ${id}: ${error.message}`);
        }
    }

    /**
     * Replace all content sections of an article
     */
    private async replaceArticleContents(article: Article, contentsDto: CreateArticleContentDto[]): Promise<void> {
        try {
            // Delete existing content sections
            await this.articleContentRepository.delete({ article });

            // Create new content sections
            const newContents = await Promise.all(
                contentsDto.map(async (contentDto) => this.createArticleContent(article, contentDto)),
            );

            article.articleContent = newContents;
        } catch (error) {
            this.logger.error(`Failed to replace article contents: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to replace article contents: ${error.message}`);
        }
    }

    /**
     * Add new content sections to an article
     */
    private async addArticleContents(article: Article, contentsDto: CreateArticleContentDto[]): Promise<void> {
        try {
            // Create new content sections
            const newContents = await Promise.all(
                contentsDto.map(async (contentDto) => this.createArticleContent(article, contentDto)),
            );

            article.articleContent = [...article.articleContent, ...newContents];
        } catch (error) {
            this.logger.error(`Failed to add article contents: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to add article contents: ${error.message}`);
        }
    }

    /**
     * Create a single article content section
     */
    private async createArticleContent(article: Article, contentDto: CreateArticleContentDto): Promise<ArticleContent> {
        try {
            // Create article content
            const content = new ArticleContent();
            content.image = contentDto.image;
            content.title = contentDto.title;
            content.type = contentDto.type;
            content.article = article;
            content.reads = [];
            content.saved = [];

            // Save the content
            const savedContent = await this.articleContentRepository.save(content);

            // Create content types if provided
            if (contentDto.contentType && contentDto.contentType.length > 0) {
                await Promise.all(
                    contentDto.contentType.map(async (contentTypeDto) => {
                        const contentType = new ContentType();
                        Object.assign(contentType, contentTypeDto);
                        contentType.articleContent = savedContent;
                        return this.contentTypeRepository.save(contentType);
                    }),
                );
            }

            return savedContent;
        } catch (error) {
            this.logger.error(`Failed to create article content: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to create article content: ${error.message}`);
        }
    }

    /**
     * Remove an article
     */
    async remove(id: number): Promise<void> {
        try {
            const article = await this.findOne(id);
            await this.articleRepository.remove(article);
        } catch (error) {
            this.logger.error(`Failed to remove article ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to remove article with ID ${id}`);
        }
    }

    /**
     * Toggle like status for a user on an article
     */
    async addLike(articleId: number, addLikeDto: AddLikeDto): Promise<Article> {
        try {
            const article = await this.findOne(articleId);
            const user = await this.userRepository.findOne({ where: { id: addLikeDto.userId } });

            if (!user) {
                throw new NotFoundException(`User with ID ${addLikeDto.userId} not found`);
            }

            // Toggle like status: if already liked, remove; otherwise add
            const alreadyLiked = article.likes.some((u) => u.id === addLikeDto.userId);
            if (alreadyLiked) {
                article.likes = article.likes.filter((u) => u.id !== addLikeDto.userId);
            } else {
                article.likes.push(user);
            }

            return await this.articleRepository.save(article);
        } catch (error) {
            this.logger.error(
                `Failed to toggle like for article ${articleId} by user ${addLikeDto.userId}: ${error.message}`,
                error.stack,
            );

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to toggle like status: ${error.message}`);
        }
    }

    /**
     * Mark an article as read by a user
     */
    async addRead(articleId: number, addRead: ReadUserArticleDto): Promise<Article | void> {
        try {
            const article = await this.articleRepository.findOne({
                where: { id: articleId },
                relations: ['articleContent', 'reads'],
            });

            if (!article) {
                throw new NotFoundException(`Article with ID ${articleId} not found`);
            }

            const user = await this.userRepository.findOne({
                where: { id: addRead.userId },
                relations: ['readArticleContent', 'readArticles'],
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${addRead.userId} not found`);
            }

            // Check if the user has read all content sections of the article
            const allContentRead = article.articleContent.every((content) =>
                user.readArticleContent.some((readContent) => readContent.id === content.id),
            );

            if (!allContentRead) {
                throw new BadRequestException('User has not read all contents of the article.');
            }

            // Add the article to the user's read articles if not already there
            if (!article.reads.some((reader) => reader.id === addRead.userId)) {
                article.reads.push(user);
                return await this.articleRepository.save(article);
            }

            return article;
        } catch (error) {
            this.logger.error(
                `Failed to mark article ${articleId} as read by user ${addRead.userId}: ${error.message}`,
                error.stack,
            );

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException(`Failed to mark article as read: ${error.message}`);
        }
    }

    /**
     * Increment the view count of an article
     */
    async incrementViews(id: number): Promise<UpdateResult> {
        try {
            // Ensure the article exists
            await this.findOne(id);

            return await this.articleRepository.increment({ id }, 'views', 1);
        } catch (error) {
            this.logger.error(`Failed to increment views for article ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to increment article views: ${error.message}`);
        }
    }

    /**
     * Toggle save status for a user on an article
     */
    async addSave(articleId: number, addSave: SaveUserArticleDto): Promise<Article> {
        try {
            const article = await this.findOne(articleId);
            const user = await this.userRepository.findOne({ where: { id: addSave.userId } });

            if (!user) {
                throw new NotFoundException(`User with ID ${addSave.userId} not found`);
            }

            // Toggle save status: if already saved, remove; otherwise add
            const alreadySave = article.saved.some((u) => u.id === addSave.userId);
            if (alreadySave) {
                article.saved = article.saved.filter((u) => u.id != addSave.userId);
            } else {
                article.saved.push(user);
            }

            return await this.articleRepository.save(article);
        } catch (error) {
            this.logger.error(
                `Failed to toggle save for article ${articleId} by user ${addSave.userId}: ${error.message}`,
                error.stack,
            );

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to toggle save status: ${error.message}`);
        }
    }
}
