import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository, UpdateResult } from 'typeorm';
import { ArticleCategory } from '../article-category/entities/article-category.entity';
import { CreateArticleContentDto } from '../article-content/dto/create-article-content-dto';
import { ArticleContent } from '../article-content/entities/article-content.entity';
import { ContentType } from '../content-type/entities/content-type.entity';
import { User } from '../users/entities/user.entity';
import { AddLikeDto, readUserArticle, saveUserArticle } from './dto/add-like.dto';
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
        @InjectRepository(ContentType)
        private readonly contentTypeRepository: Repository<ContentType>,
        private readonly dataSource: DataSource,
    ) {}

    async create(createArticleDto: CreateArticleDto): Promise<Article> {
        const { title, description, authorIds, thumbnail, isPremium, categoryId, readingTime, contents } =
            createArticleDto;

        return await this.dataSource.transaction(async (manager) => {
            let authors = [];
            let category = null;
            const errors: string[] = [];
            try {
                console.log('je passe la');
                // Vérification des auteurs
                authors = await manager.find(User, { where: { id: In(authorIds) } });
                const missingAuthors = authorIds.filter((id) => !authors.some((author) => author.id === id));
                if (missingAuthors.length > 0) {
                    errors.push(`The following authorId(s) were not found: ${missingAuthors.join(', ')}`);
                }
                // Vérification de la catégorie
                category = await manager.findOneOrFail(ArticleCategory, { where: { id: categoryId } });
                console.log('je passe la aussi');
            } catch (error) {
                if (error.name === 'EntityNotFound') {
                    errors.push(`The categoryId '${categoryId}' was not found.`);
                } else {
                    throw new BadRequestException('An unexpected error occurred during validation.');
                }
            }
            console.log('errors', errors);
            if (errors.length > 0) {
                throw new BadRequestException({
                    message: 'Validation failed for one or more fields.',
                    errors: errors,
                });
            }

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

            for (const contentData of contents) {
                const { contentType, ...articleContentData } = contentData;
                const newArticleContent = manager.create(ArticleContent, {
                    ...articleContentData,
                    article: savedArticle,
                });
                const savedArticleContent = await manager.save(ArticleContent, newArticleContent);

                const contentTypes = contentType.map((contentTypeData) => {
                    return manager.create(ContentType, {
                        ...contentTypeData,
                        articleContent: savedArticleContent,
                    });
                });

                await manager.save(ContentType, contentTypes);
            }

            const loadedArticle = await manager.findOne(Article, {
                where: { id: savedArticle.id },
                relations: { authors: true, category: true, articleContent: true },
            });

            return loadedArticle;
        });
    }

    async findAll(): Promise<Article[]> {
        return this.articleRepository.find({ relations: ['authors', 'likes', 'reads', 'saved', 'articleContent'] });
    }

    async findOne(id: number): Promise<Article> {
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
            ],
        });
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        return article;
    }

    async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
        const { categoryId, replaceAuthorIds, addAuthorIds, addContents, replaceContents, ...otherUpdates } =
            updateArticleDto;
        const article = await this.findOne(id);
        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        Object.assign(article, otherUpdates);

        if (categoryId) {
            const category = await this.articleCategoryRepository.findOne({ where: { id: categoryId } });
            if (!category) {
                throw new NotFoundException(`Category with ID ${categoryId} not found`);
            }
            article.category = category;
        }

        if (replaceAuthorIds) {
            const authors = await this.userRepository.find({ where: { id: In(replaceAuthorIds) } });
            article.authors = authors;
        } else if (addAuthorIds) {
            const authorsToAdd = await this.userRepository.find({ where: { id: In(addAuthorIds) } });
            article.authors = [...article.authors, ...authorsToAdd];
        }

        if (replaceContents) {
            await this.replaceArticleContents(article, replaceContents);
        } else if (addContents) {
            await this.addArticleContents(article, addContents);
        }

        const updatedArticle = await this.articleRepository.save(article);

        updatedArticle.articleContent.forEach((content) => {
            delete content.article;
        });
        return updatedArticle;
    }

    private async replaceArticleContents(article: Article, contentsDto: CreateArticleContentDto[]): Promise<void> {
        await this.articleContentRepository.delete({ article });
        const newContents = await Promise.all(
            contentsDto.map(async (contentDto) => this.createArticleContent(article, contentDto)),
        );
        article.articleContent = newContents;
    }

    private async addArticleContents(article: Article, contentsDto: CreateArticleContentDto[]): Promise<void> {
        const newContents = await Promise.all(
            contentsDto.map(async (contentDto) => this.createArticleContent(article, contentDto)),
        );

        article.articleContent = [...article.articleContent, ...newContents];
    }

    private async createArticleContent(article: Article, contentDto: CreateArticleContentDto): Promise<ArticleContent> {
        const content = new ArticleContent();
        content.image = contentDto.image;
        content.title = contentDto.title;
        content.type = contentDto.type;
        content.article = article;
        // Ajouter les types de contenu (ContentType)
        const savedContent = await this.articleContentRepository.save(content);
        if (contentDto.contentType) {
            const savedContentType = await Promise.all(
                contentDto.contentType.map(async (contentTypeDto) => {
                    const contentType = new ContentType();
                    Object.assign(contentType, contentTypeDto);
                    contentType.articleContent = savedContent;
                    return this.contentTypeRepository.save(contentType);
                }),
            );
        }

        return this.articleContentRepository.save(content);
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
        if (alreadyLiked) {
            article.likes = article.likes.filter((u) => u.id === user.id);
        } else {
            article.likes.push(user);
        }

        return this.articleRepository.save(article);
    }

    async addRead(articleId: number, addRead: readUserArticle): Promise<void> {
        const article = await this.articleRepository.findOne({
            where: { id: articleId },
            relations: ['articleContent', 'reads'],
        });

        if (!article) {
            throw new NotFoundException(`Article Content with ID ${articleId} not found`);
        }

        const user = await this.userRepository.findOne({
            where: { id: addRead.userId },
            relations: ['readArticleContent', 'readArticles'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${addRead.userId} not found`);
        }

        const allContentRead = article.articleContent.every((content) =>
            user.readArticleContent.some((readContent) => readContent.id === content.id),
        );

        if (!allContentRead) {
            throw new BadRequestException('User has not read all contents of the article.');
        }

        if (allContentRead) {
            if (!article.reads.some((reader) => reader.id === addRead.userId)) {
                article.reads.push(user);
                await this.articleRepository.save(article);
            }
        }
    }

    async incrementViews(id: number): Promise<UpdateResult> {
        return this.articleRepository.increment({ id }, 'views', 1);
    }

    async addSave(articleId: number, addSave: saveUserArticle): Promise<Article> {
        const article = await this.findOne(articleId);
        const user = await this.userRepository.findOne({ where: { id: addSave.userId } });

        if (!article) {
            throw new NotFoundException(`Article with ID ${addSave.userId} not found`);
        }

        if (!user) {
            throw new NotFoundException(`User with ID ${addSave.userId} not found`);
        }

        const alreadySave = article.saved.some((u) => u.id === addSave.userId);
        if (alreadySave) {
            article.saved = article.saved.filter((u) => u.id != addSave.userId);
        } else {
            article.saved.push(user);
        }

        return this.articleRepository.save(article);
    }
}
