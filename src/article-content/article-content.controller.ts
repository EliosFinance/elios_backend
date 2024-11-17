import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ArticleContentService } from './article-content.service';
import { CreateArticleContentDto } from './dto/create-article-content-dto';
import { UpdateArticleContentDto } from './dto/update-article-content-dto';

@Controller('article-content')
export class ArticleContentController {
    constructor(private readonly articleContentService: ArticleContentService) {}

    @Post()
    async create(@Body() createArticleContentDto: CreateArticleContentDto) {
        return this.articleContentService.create(createArticleContentDto);
    }

    @Get()
    async findAll(@Query('type') type?: string) {
        return this.articleContentService.findAll(type);
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.articleContentService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateArticleContentDto: UpdateArticleContentDto) {
        return this.articleContentService.update(id, updateArticleContentDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.articleContentService.remove(id);
    }
}
