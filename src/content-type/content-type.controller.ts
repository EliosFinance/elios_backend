import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ContentTypeService } from './content-type.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { ContentType } from './entities/content-type.entity';

@Controller('content-type')
export class ContentTypeController {
    constructor(private readonly contentTypeService: ContentTypeService) {}

    @Post()
    async create(@Body() createContentTypeDto: CreateContentTypeDto): Promise<ContentType> {
        return this.contentTypeService.create(createContentTypeDto);
    }

    @Get()
    async findAll(): Promise<ContentType[]> {
        return this.contentTypeService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<ContentType> {
        return this.contentTypeService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateData: Partial<ContentType>): Promise<ContentType> {
        return this.contentTypeService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.contentTypeService.remove(id);
    }
}
