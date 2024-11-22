import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { ContentType } from '../content-type/entities/content-type.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleContentDto } from './dto/create-article-content-dto';
import { readUser, saveUser } from './dto/relation-article-content.dto';
import { UpdateArticleContentDto, UpdateMode } from './dto/update-article-content-dto';
import { ArticleContent } from './entities/article-content.entity';

@Injectable()
export class ArticleContentService {
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

    async create(createArticleContentDto: CreateArticleContentDto): Promise<ArticleContent> {
        const { image, title, type, readsUserId, savedUserId, contentType, articleId } = createArticleContentDto;

        const errors: string[] = [];
        let reads = [];
        let saved = [];

        // Vérification des readsUserId
        if (readsUserId && readsUserId.length > 0) {
            reads = await this.userRepository.findBy({ id: In(readsUserId) });
            const missingReads = readsUserId.filter((id) => !reads.some((read) => read.id === id));
            if (missingReads.length > 0) {
                errors.push(`The following readsUserId(s) were not found: ${missingReads.join(', ')}`);
            }
        }

        // Vérification des savedUserId
        if (savedUserId && savedUserId.length > 0) {
            saved = await this.userRepository.findBy({ id: In(savedUserId) });
            saved = await this.userRepository.findBy({ id: In(savedUserId) });
            const missingSaved = savedUserId.filter((id) => !saved.some((save) => save.id === id));
            if (missingSaved.length > 0) {
                errors.push(`The following savedUserId(s) were not found: ${missingSaved.join(', ')}`);
            }
        }

        // Vérification de l'article
        if (!articleId) {
            throw new BadRequestException('The articleId "' + articleId + '" does not exist');
        }

        const article = await this.articleRepository.findOneBy({ id: articleId });
        if (!article) {
            errors.push(`The articleId '${articleId}' was not found.`);
        }

        if (errors.length > 0) {
            throw new BadRequestException({
                message: 'Validation failed for one or more fields.',
                errors,
            });
        }

        const savedArticleContent = await this.dataSource.transaction(async (manager) => {
            const newArticleContent = manager.create(ArticleContent, {
                image,
                type,
                title,
                reads: reads.length > 0 ? reads : null,
                saved: saved.length > 0 ? saved : null,
                article: article || null,
            });

            const savedArticleContent = await manager.save(ArticleContent, newArticleContent);

            const contentTypes = contentType.map((contentTypeData) => {
                return manager.create('ContentType', {
                    ...contentTypeData,
                    articleContent: savedArticleContent,
                });
            });

            await manager.save('ContentType', contentTypes);
            return savedArticleContent;
        });

        const loadedArticleContent = await this.articleContentRepository.findOne({
            where: { id: savedArticleContent.id },
            relations: ['reads', 'saved', 'article', 'contentType'],
        });

        return loadedArticleContent;
    }

    async findAll(type?: string) {
        return this.articleContentRepository.find({ relations: ['reads', 'saved', 'article', 'contentType'] });
    }

    async findOne(id: number) {
        const articleContent = await this.articleContentRepository.findOne({
            where: { id: id },
            relations: { reads: true, saved: true, article: true, contentType: true },
        });
        if (!articleContent) {
            throw new NotFoundException(`ArticleContent with id ${id} not found`);
        }
        return articleContent;
    }

    async update(id: number, updateArticleContentDto: UpdateArticleContentDto): Promise<ArticleContent> {
        const { contentType, updateMode, ...otherUpdates } = updateArticleContentDto;

        const articleContent = await this.findOne(id);
        if (!articleContent) {
            throw new NotFoundException(`ArticleContent with id ${id} not found`);
        }

        // Mises à jour simples sur l'article
        Object.assign(articleContent, otherUpdates);

        const updatedArticleContent = await this.articleContentRepository.save(articleContent);

        if (contentType) {
            await this.dataSource.transaction(async (manager) => {
                if ((updateMode || UpdateMode.ADD) === UpdateMode.REPLACE) {
                    // Supprimer tous les anciens ContentTypes liés à l'article
                    await manager.delete('ContentType', { articleContent: updatedArticleContent });

                    // Créer les nouveaux ContentTypes
                    const newContentTypes = contentType.map((contentTypeData) =>
                        manager.create('ContentType', {
                            ...contentTypeData,
                            articleContent: updatedArticleContent, // Associer après la sauvegarde
                        }),
                    );

                    // Sauvegarder les nouveaux ContentTypes
                    await manager.save('ContentType', newContentTypes);
                } else if ((updateMode || UpdateMode.ADD) === UpdateMode.ADD) {
                    // Ajouter uniquement de nouveaux ContentTypes
                    const newContentTypes = contentType.map((contentTypeData) =>
                        manager.create('ContentType', {
                            ...contentTypeData,
                            articleContent: updatedArticleContent, // Associer après la sauvegarde
                        }),
                    );

                    // Sauvegarder les nouveaux ContentTypes
                    await manager.save('ContentType', newContentTypes);
                }
            });
        }

        // Recharger l'article avec toutes ses relations
        const loadedArticleContent = await this.articleContentRepository.findOne({
            where: { id: updatedArticleContent.id },
            relations: ['reads', 'saved', 'article', 'contentType'],
        });

        return loadedArticleContent;
    }

    async remove(id: number) {
        const articleContent = await this.findOne(id);
        if (!articleContent) {
            throw new NotFoundException(`ArticleContent with id ${id} not found`);
        }
        return this.articleContentRepository.remove(articleContent);
    }

    async addRead(articleContentId: number, addRead: readUser): Promise<ArticleContent> {
        const articleContent = await this.findOne(articleContentId);
        const user = await this.userRepository.findOne({ where: { id: addRead.userId } });

        if (!articleContent) {
            throw new NotFoundException(`Article Content with ID ${articleContentId} not found`);
        }

        if (!user) {
            throw new NotFoundException(`User with ID ${addRead.userId} not found`);
        }

        const alreadyRead = articleContent.reads.some((u) => u.id === addRead.userId);
        if (alreadyRead) {
            articleContent.reads = articleContent.reads.filter((u) => u.id != addRead.userId);
        } else {
            articleContent.reads.push(user);
        }

        return this.articleContentRepository.save(articleContent);
    }

    async addSave(articleContentId: number, addSave: saveUser): Promise<ArticleContent> {
        const articleContent = await this.findOne(articleContentId);
        const user = await this.userRepository.findOne({ where: { id: addSave.userId } });

        if (!articleContent) {
            throw new NotFoundException(`Article Content with ID ${articleContentId} not found`);
        }

        if (!user) {
            throw new NotFoundException(`User with ID ${addSave.userId} not found`);
        }

        const alreadySave = articleContent.saved.some((u) => u.id === addSave.userId);
        if (alreadySave) {
            articleContent.saved = articleContent.saved.filter((u) => u.id != addSave.userId);
        } else {
            articleContent.saved.push(user);
        }

        return this.articleContentRepository.save(articleContent);
    }
}
