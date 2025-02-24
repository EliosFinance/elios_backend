import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, Query } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { getUserIdFromToken } from '../../helpers/extractJwt';
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

    @Get('/userSaved')
    async userSaved(@Headers('authorization') authorization: string) {
        const userId = getUserIdFromToken(authorization);
        return this.articleContentService.userSaved(userId);
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
    addRead(@Param('id') id: number, @Headers('authorization') authorization: string) {
        const payload = getUserIdFromToken(authorization);

        const readUser: readUser = {
            userId: Number(payload),
        };

        return this.articleContentService.addRead(+id, readUser);
    }

    @Put(':id/save')
    addSave(@Param('id') id: number, @Headers('authorization') authorization: string) {
        const payload = getUserIdFromToken(authorization);

        const saveUser: saveUser = {
            userId: Number(payload),
        };

        return this.articleContentService.addSave(+id, saveUser);
    }
}
