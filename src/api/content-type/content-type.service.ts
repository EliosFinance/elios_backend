import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleContent } from '../articles/entities/article-content-entity';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { TextUpdateMode, UpdateContentTypeDto } from './dto/update-content-type.dto';
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
        return this.contentTypeRepository.find({ relations: ['articleContent'] });
    }

    async findOne(id: number): Promise<ContentType> {
        return this.contentTypeRepository.findOne({ where: { id }, relations: ['articleContent'] });
    }

    async update(id: number, updateContentTypeDto: UpdateContentTypeDto): Promise<ContentType> {
        const contentType = await this.contentTypeRepository.findOne({
            where: { id },
            relations: ['articleContent'],
        });

        if (!contentType) {
            throw new NotFoundException(`ContentType with ID ${id} not found`);
        }

        if (updateContentTypeDto.type !== undefined) {
            contentType.type = updateContentTypeDto.type;
        }

        if (updateContentTypeDto.text) {
            const updateMode = updateContentTypeDto.updateMode || TextUpdateMode.REPLACE;

            if (updateMode === TextUpdateMode.REPLACE) {
                contentType.text = updateContentTypeDto.text;
            } else if (updateMode === TextUpdateMode.ADD) {
                contentType.text = [...contentType.text, ...updateContentTypeDto.text];
            }
        }

        if (updateContentTypeDto.articleContentId) {
            const articleContent = await this.articleContentRepository.findOne({
                where: { id: updateContentTypeDto.articleContentId },
            });
            if (!articleContent) {
                throw new NotFoundException(
                    `ArticleContent with id ${updateContentTypeDto.articleContentId} not found`,
                );
            }

            contentType.articleContent = articleContent;
        }

        return this.contentTypeRepository.save(contentType);
    }

    async remove(id: number): Promise<void> {
        await this.contentTypeRepository.delete(id);
    }
}
