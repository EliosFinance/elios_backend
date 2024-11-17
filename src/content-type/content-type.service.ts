import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { ContentType } from './entities/content-type.entity';

@Injectable()
export class ContentTypeService {
    constructor(
        @InjectRepository(ContentType)
        private readonly contentTypeRepository: Repository<ContentType>,
    ) {}

    async create(createContentTypeDto: CreateContentTypeDto): Promise<ContentType> {
        const contentType = this.contentTypeRepository.create(createContentTypeDto);
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
