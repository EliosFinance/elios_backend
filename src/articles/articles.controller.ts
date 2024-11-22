import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { AddLikeDto, readUserArticle, saveUserArticle } from './dto/add-like.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
@ApiTags('Articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @Post()
    create(@Body() createArticleDto: CreateArticleDto) {
        return this.articlesService.create(createArticleDto);
    }

    @Get()
    findAll() {
        return this.articlesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.articlesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
        return this.articlesService.update(+id, updateArticleDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.articlesService.remove(+id);
    }

    @Put(':id/likes')
    addLike(@Param('id') id: string, @Body() addLikeDto: AddLikeDto) {
        return this.articlesService.addLike(+id, addLikeDto);
    }

    @Put(':id/views')
    incrementViews(@Param('id') id: string) {
        return this.articlesService.incrementViews(+id);
    }

    @Put(':id/read')
    addRead(@Param('id') id: number, @Body() addRead: readUserArticle) {
        return this.articlesService.addRead(+id, addRead);
    }

    @Put(':id/save')
    addSave(@Param('id') id: number, @Body() addSave: saveUserArticle) {
        return this.articlesService.addSave(+id, addSave);
    }
}
