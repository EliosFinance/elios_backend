import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    ) {}

    async create(createArticleContentDto: CreateArticleContentDto): Promise<ArticleContent> {
        const { image, title, type, readsUserId, savedUserId, contentTypeId, articleId } = createArticleContentDto;

        let reads = [];
        let saved = [];
        let contentType = [];
        let article = null;

        // Vérification des readsUserId
        if (readsUserId && readsUserId.length > 0) {
            reads = await this.userRepository.findBy({ id: In(readsUserId) });
        }

        // Vérification des savedUserId
        if (savedUserId && savedUserId.length > 0) {
            saved = await this.userRepository.findBy({ id: In(savedUserId) });
        }

        // Vérification des contentTypeId
        if (contentTypeId && contentTypeId.length > 0) {
            contentType = await this.contentTypeRepository.findBy({ id: In(contentTypeId) });
        }

        // Vérification de l'article
        if (articleId) {
            article = await this.articleRepository.findOneBy({ id: articleId });
        }

        // Création d'un nouvel article de contenu
        const newArticleContent = this.articleContentRepository.create({
            image,
            type,
            title,
            reads: reads.length > 0 ? reads : null, // Utilisation de null si aucune donnée
            saved: saved.length > 0 ? saved : null,
            contentType: contentType.length > 0 ? contentType : null,
            article: article || null,
        });

        return this.articleContentRepository.save(newArticleContent);
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
