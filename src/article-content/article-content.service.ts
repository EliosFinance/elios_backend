import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { ContentType } from '../content-type/entities/content-type.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleContentDto } from './dto/create-article-content-dto';
import { UpdateArticleContentDto } from './dto/update-article-content-dto';
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
        let article = null;

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
        if (articleId) {
            article = await this.articleRepository.findOneBy({ id: articleId });
            if (!article) {
                errors.push(`The articleId '${articleId}' was not found.`);
            }
        }

        if (errors.length > 0) {
            throw new BadRequestException({
                message: 'Validation failed for one or more fields.',
                errors,
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            const newArticleContent = manager.create(ArticleContent, {
                image,
                type,
                title,
                reads: reads.length > 0 ? reads : null,
                saved: saved.length > 0 ? saved : null,
                article: article || null,
            });

            const savedArticleContent = await manager.save(ArticleContent, newArticleContent);

            if (contentType && contentType.length > 0) {
                const contentTypes = contentType.map((contentTypeData) => {
                    return manager.create('ContentType', {
                        ...contentTypeData,
                        articleContent: savedArticleContent,
                    });
                });

                await manager.save('ContentType', contentTypes);
            }
            return savedArticleContent;
        });

        // Création d'un nouvel article de contenu
        // const newArticleContent = this.articleContentRepository.create({
        //     image,
        //     type,
        //     title,
        //     reads: reads.length > 0 ? reads : null, // Utilisation de null si aucune donnée
        //     saved: saved.length > 0 ? saved : null,
        //     article: article || null,
        // });
        //
        // const savedArticleContent = await this.articleContentRepository.save(newArticleContent)
        //
        // if (contentType && contentType.length > 0) {
        //     console.log('contentType', contentType);
        //     const contentTypes = contentType.map((contentTypeData) => {
        //         const newContentType = this.contentTypeRepository.create({
        //             ...contentTypeData,
        //             articleContent: savedArticleContent
        //         })
        //         return this.contentTypeRepository.save(newContentType);
        //     })
        //     await Promise.all(contentTypes)
        // }
        //
        // return savedArticleContent;
    }

    async findAll(type?: string) {
        return this.articleContentRepository.find();
    }

    async findOne(id: number) {
        const articleContent = await this.articleContentRepository.findOne({
            where: { id },
        });
        if (!articleContent) {
            throw new NotFoundException(`ArticleContent with id ${id} not found`);
        }
        return articleContent;
    }

    async update(id: number, updateArticleContentDto: UpdateArticleContentDto) {
        const articleContent = await this.findOne(id);
        const updatedArticleContent = Object.assign(articleContent, updateArticleContentDto);
        return this.articleContentRepository.save(updatedArticleContent);
    }

    async remove(id: number) {
        const articleContent = await this.findOne(id);
        return this.articleContentRepository.remove(articleContent);
    }
}
