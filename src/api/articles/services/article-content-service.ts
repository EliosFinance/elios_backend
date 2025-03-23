import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ContentType } from '../../content-type/entities/content-type.entity';
import { User } from '../../users/entities/user.entity';
import { CreateArticleContentDto } from '../dto/article-content-dtos';
import { ReadUserDto, SaveUserDto } from '../dto/article-content-dtos';
import { UpdateArticleContentDto, UpdateMode } from '../dto/article-content-dtos';
import { ArticleContent } from '../entities/article-content-entity';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticleContentService {
    private readonly logger = new Logger(ArticleContentService.name);

    constructor(
        @InjectRepository(ArticleContent)
        private readonly articleContentRepository: Repository<ArticleContent>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(ContentType)
        private readonly contentTypeRepository: Repository<ContentType>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Create a new article content section
     */
    async create(createArticleContentDto: CreateArticleContentDto): Promise<ArticleContent> {
        const { image, title, type, readsUserId, savedUserId, contentType, articleId } = createArticleContentDto;

        try {
            const errors: string[] = [];
            let reads = [];
            let saved = [];

            // Validate users who have read the content
            if (readsUserId && readsUserId.length > 0) {
                reads = await this.userRepository.findBy({ id: In(readsUserId) });
                const missingReads = readsUserId.filter((id) => !reads.some((read) => read.id === id));
                if (missingReads.length > 0) {
                    errors.push(`Users with the following IDs were not found: ${missingReads.join(', ')}`);
                }
            }

            // Validate users who have saved the content
            if (savedUserId && savedUserId.length > 0) {
                saved = await this.userRepository.findBy({ id: In(savedUserId) });
                const missingSaved = savedUserId.filter((id) => !saved.some((save) => save.id === id));
                if (missingSaved.length > 0) {
                    errors.push(`Users with the following IDs were not found: ${missingSaved.join(', ')}`);
                }
            }

            // Validate article
            let article = null;
            if (articleId) {
                article = await this.articleRepository.findOneBy({ id: articleId });
                if (!article) {
                    errors.push(`Article with ID ${articleId} was not found.`);
                }
            }

            if (errors.length > 0) {
                throw new BadRequestException({
                    message: 'Validation failed for one or more fields.',
                    errors,
                });
            }

            // Use transaction to ensure data integrity
            const savedArticleContent = await this.dataSource.transaction(async (manager) => {
                // Create article content
                const newArticleContent = manager.create(ArticleContent, {
                    image,
                    type,
                    title,
                    reads: reads.length > 0 ? reads : [],
                    saved: saved.length > 0 ? saved : [],
                    article: article,
                });

                const savedArticleContent = await manager.save(ArticleContent, newArticleContent);

                // Create content types
                if (contentType && contentType.length > 0) {
                    const contentTypes = contentType.map((contentTypeData) => {
                        return manager.create(ContentType, {
                            ...contentTypeData,
                            articleContent: savedArticleContent,
                        });
                    });

                    await manager.save(ContentType, contentTypes);
                }

                return savedArticleContent;
            });

            // Load the complete entity with all relations
            return await this.articleContentRepository.findOne({
                where: { id: savedArticleContent.id },
                relations: ['reads', 'saved', 'article', 'contentType'],
            });
        } catch (error) {
            this.logger.error(`Failed to create article content: ${error.message}`, error.stack);

            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new BadRequestException(`Failed to create article content: ${error.message}`);
        }
    }

    /**
     * Get all article content sections
     */
    async findAll(type?: string): Promise<ArticleContent[]> {
        try {
            const queryBuilder = this.articleContentRepository
                .createQueryBuilder('articleContent')
                .leftJoinAndSelect('articleContent.reads', 'reads')
                .leftJoinAndSelect('articleContent.saved', 'saved')
                .leftJoinAndSelect('articleContent.article', 'article')
                .leftJoinAndSelect('articleContent.contentType', 'contentType');

            // Filter by type if provided
            if (type) {
                queryBuilder.where('articleContent.type = :type', { type });
            }

            return await queryBuilder.getMany();
        } catch (error) {
            this.logger.error(`Failed to find all article content: ${error.message}`, error.stack);
            throw new BadRequestException('Failed to retrieve article content sections');
        }
    }

    /**
     * Get content sections saved by a specific user
     */
    async userSaved(userId: number): Promise<ArticleContent[]> {
        try {
            return await this.articleContentRepository.find({
                where: { saved: { id: userId } },
                relations: ['authors', 'likes', 'reads', 'saved', 'articleContent'],
            });
        } catch (error) {
            this.logger.error(`Failed to find user saved content for user ${userId}: ${error.message}`, error.stack);
            throw new BadRequestException(`Failed to retrieve saved content for user ID ${userId}`);
        }
    }

    /**
     * Get a specific article content section by ID
     */
    async findOne(id: number): Promise<ArticleContent> {
        try {
            const articleContent = await this.articleContentRepository.findOne({
                where: { id: id },
                relations: { reads: true, saved: true, article: true, contentType: true },
            });

            if (!articleContent) {
                throw new NotFoundException(`Article content with ID ${id} not found`);
            }

            return articleContent;
        } catch (error) {
            this.logger.error(`Failed to find article content ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to retrieve article content with ID ${id}`);
        }
    }

    /**
     * Update an article content section
     */
    async update(id: number, updateArticleContentDto: UpdateArticleContentDto): Promise<ArticleContent> {
        try {
            const { contentType, updateMode, ...otherUpdates } = updateArticleContentDto;

            // Find the content section first to ensure it exists
            const articleContent = await this.findOne(id);

            // Update basic properties
            Object.assign(articleContent, otherUpdates);

            // Save basic updates
            const updatedArticleContent = await this.articleContentRepository.save(articleContent);

            // Update content types if provided
            if (contentType && contentType.length > 0) {
                await this.dataSource.transaction(async (manager) => {
                    const mode = updateMode || UpdateMode.ADD;

                    // Replace mode: remove existing content types and add new ones
                    if (mode === UpdateMode.REPLACE) {
                        await manager.delete(ContentType, { articleContent: updatedArticleContent });

                        const newContentTypes = contentType.map((contentTypeData) =>
                            manager.create(ContentType, {
                                ...contentTypeData,
                                articleContent: updatedArticleContent,
                            }),
                        );

                        await manager.save(ContentType, newContentTypes);
                    }
                    // Add mode: just add new content types without removing existing ones
                    else if (mode === UpdateMode.ADD) {
                        const newContentTypes = contentType.map((contentTypeData) =>
                            manager.create(ContentType, {
                                ...contentTypeData,
                                articleContent: updatedArticleContent,
                            }),
                        );

                        await manager.save(ContentType, newContentTypes);
                    }
                });
            }

            // Load and return the complete updated entity with all relations
            return await this.articleContentRepository.findOne({
                where: { id: updatedArticleContent.id },
                relations: ['reads', 'saved', 'article', 'contentType'],
            });
        } catch (error) {
            this.logger.error(`Failed to update article content ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to update article content with ID ${id}: ${error.message}`);
        }
    }

    /**
     * Remove an article content section
     */
    async remove(id: number): Promise<void> {
        try {
            const articleContent = await this.findOne(id);
            await this.articleContentRepository.remove(articleContent);
        } catch (error) {
            this.logger.error(`Failed to remove article content ${id}: ${error.message}`, error.stack);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to remove article content with ID ${id}`);
        }
    }

    /**
     * Toggle read status for a user on an article content section
     */
    async addRead(articleContentId: number, addRead: ReadUserDto): Promise<ArticleContent> {
        try {
            const articleContent = await this.findOne(articleContentId);
            const user = await this.userRepository.findOne({ where: { id: addRead.userId } });

            if (!user) {
                throw new NotFoundException(`User with ID ${addRead.userId} not found`);
            }

            // Toggle read status: if already read, remove; otherwise add
            const alreadyRead = articleContent.reads.some((u) => u.id === addRead.userId);
            if (alreadyRead) {
                articleContent.reads = articleContent.reads.filter((u) => u.id != addRead.userId);
            } else {
                articleContent.reads.push(user);
            }

            return await this.articleContentRepository.save(articleContent);
        } catch (error) {
            this.logger.error(
                `Failed to toggle read status for content ${articleContentId} by user ${addRead.userId}: ${error.message}`,
                error.stack,
            );

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to toggle read status: ${error.message}`);
        }
    }

    /**
     * Toggle save status for a user on an article content section
     */
    async addSave(articleContentId: number, addSave: SaveUserDto): Promise<ArticleContent> {
        try {
            const articleContent = await this.findOne(articleContentId);
            const user = await this.userRepository.findOne({ where: { id: addSave.userId } });

            if (!user) {
                throw new NotFoundException(`User with ID ${addSave.userId} not found`);
            }

            // Toggle save status: if already saved, remove; otherwise add
            const alreadySave = articleContent.saved.some((u) => u.id === addSave.userId);
            if (alreadySave) {
                articleContent.saved = articleContent.saved.filter((u) => u.id !== addSave.userId);
            } else {
                articleContent.saved.push(user);
            }

            return await this.articleContentRepository.save(articleContent);
        } catch (error) {
            this.logger.error(
                `Failed to toggle save status for content ${articleContentId} by user ${addSave.userId}: ${error.message}`,
                error.stack,
            );

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException(`Failed to toggle save status: ${error.message}`);
        }
    }
}
