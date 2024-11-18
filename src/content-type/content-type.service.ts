import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleContent } from '../article-content/entities/article-content.entity';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { ContentType } from './entities/content-type.entity';

@Injectable()
export class ContentTypeService {
    constructor(
        @InjectRepository(ContentType)
        private readonly contentTypeRepository: Repository<ContentType>,
        @InjectRepository(ArticleContent)
        private readonly articleContentRepository: Repository<ArticleContent>,
    ) {}

    async create(createContentTypeDto: CreateContentTypeDto): Promise<ContentType> {
        if (!createContentTypeDto.articleContentId) {
            throw new BadRequestException('articleContentId is required and cannot be empty.');
        }
        const articleContent = await this.articleContentRepository.findOne({
            where: { id: createContentTypeDto.articleContentId },
        });
        if (!articleContent) {
            throw new NotFoundException('Article content not found');
        }

        const contentType = this.contentTypeRepository.create({
            ...createContentTypeDto,
            articleContent,
        });
        return this.contentTypeRepository.save(contentType);
    }

    async findAll(): Promise<ContentType[]> {
        return this.contentTypeRepository.find({ relations: ['card'] });
    }

    async findOne(id: number): Promise<ContentType> {
        return this.contentTypeRepository.findOne({ where: { id }, relations: ['card'] });
    }

    async update(id: number, updateData: Partial<ContentType>): Promise<ContentType> {
        await this.contentTypeRepository.update(id, updateData);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.contentTypeRepository.delete(id);
    }
}
