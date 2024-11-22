import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ArticleContentService } from './article-content.service';
import { CreateArticleContentDto } from './dto/create-article-content-dto';
import { readUser, saveUser } from './dto/relation-article-content.dto';
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
        return this.articleContentService.findOne(+id);
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateArticleContentDto: UpdateArticleContentDto) {
        return this.articleContentService.update(+id, updateArticleContentDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.articleContentService.remove(+id);
    }

    @Put(':id/read')
    addRead(@Param('id') id: number, @Body() addRead: readUser) {
        return this.articleContentService.addRead(+id, addRead);
    }

    @Put(':id/save')
    addSave(@Param('id') id: number, @Body() addSave: saveUser) {
        return this.articleContentService.addSave(+id, addSave);
    }
}
