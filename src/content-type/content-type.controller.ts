import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ContentTypeService } from './content-type.service';
import { CreateContentTypeDto } from './dto/create-content-type.dto';
import { UpdateContentTypeDto } from './dto/update-content-type.dto';
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

    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateContentTypeDto: UpdateContentTypeDto): Promise<ContentType> {
        return this.contentTypeService.update(id, updateContentTypeDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        return this.contentTypeService.remove(id);
    }
}
