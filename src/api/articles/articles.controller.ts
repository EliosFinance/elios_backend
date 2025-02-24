import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { getUserIdFromToken } from '../../helpers/extractJwt';
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

    @Get('/trendings')
    async findTrending() {
        console.log('aaa');

        return this.articlesService.findTrending();
    }

    @Get('/userReads')
    async userReads(@Headers('authorization') authorization: string) {
        const userId = getUserIdFromToken(authorization);
        return this.articlesService.userReads(userId);
    }

    @Get('/userLikes')
    async userLikes(@Headers('authorization') authorization: string) {
        const userId = getUserIdFromToken(authorization);
        return this.articlesService.userLikes(userId);
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
    addLike(@Param('id') id: string, @Headers('authorization') authorization: string) {
        const payload = getUserIdFromToken(authorization);

        const addLikeDto: AddLikeDto = {
            userId: Number(payload),
        };
        return this.articlesService.addLike(+id, addLikeDto);
    }

    @Put(':id/views')
    incrementViews(@Param('id') id: string) {
        return this.articlesService.incrementViews(+id);
    }

    @Put(':id/read')
    addRead(@Param('id') id: number, @Headers('authorization') authorization: string) {
        const payload = getUserIdFromToken(authorization);

        const readUser: readUserArticle = {
            userId: Number(payload),
        };

        return this.articlesService.addRead(+id, readUser);
    }

    @Put(':id/save')
    addSave(@Param('id') id: number, @Headers('authorization') authorization: string) {
        const payload = getUserIdFromToken(authorization);

        const saveUser: readUserArticle = {
            userId: Number(payload),
        };

        return this.articlesService.addSave(+id, saveUser);
    }
}
