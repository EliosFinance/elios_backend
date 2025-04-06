import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getUserIdFromToken } from '../../../helpers/jwt/extractJwt';
import { Public } from '../../auth/decorator/public.decorator';
import {
    AddLikeDto,
    ArticleResponseDto,
    CreateArticleDto,
    ReadUserArticleDto,
    SaveUserArticleDto,
    UpdateArticleDto,
} from '../dto/article-dtos';
import { Article } from '../entities/article.entity';
import { ArticlesService } from '../services/articles.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new article' })
    @ApiCreatedResponse({
        description: 'The article has been successfully created.',
        type: ArticleResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
        return this.articlesService.create(createArticleDto);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all articles' })
    @ApiOkResponse({
        description: 'Retrieved all articles successfully.',
        type: [ArticleResponseDto],
    })
    async findAll(): Promise<Article[]> {
        return this.articlesService.findAll();
    }

    @Get('trendings')
    @Public()
    @ApiOperation({ summary: 'Get trending articles' })
    @ApiOkResponse({
        description: 'Retrieved trending articles successfully.',
        type: [ArticleResponseDto],
    })
    async findTrending(): Promise<Article[]> {
        return this.articlesService.findTrending();
    }

    @Get('userReads')
    @ApiOperation({ summary: 'Get articles read by the current user' })
    @ApiOkResponse({
        description: 'Retrieved user read articles successfully.',
        type: [ArticleResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async userReads(@Headers('authorization') authorization: string): Promise<Article[]> {
        const userId = getUserIdFromToken(authorization);
        return this.articlesService.userReads(userId);
    }

    @Get('userLikes')
    @ApiOperation({ summary: 'Get articles liked by the current user' })
    @ApiOkResponse({
        description: 'Retrieved user liked articles successfully.',
        type: [ArticleResponseDto],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async userLikes(@Headers('authorization') authorization: string): Promise<Article[]> {
        const userId = getUserIdFromToken(authorization);
        return this.articlesService.userLikes(userId);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get an article by ID' })
    @ApiParam({ name: 'id', description: 'Article ID' })
    @ApiOkResponse({
        description: 'Retrieved the article successfully.',
        type: ArticleResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Article not found.' })
    async findOne(@Param('id') id: string): Promise<Article> {
        return this.articlesService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an article' })
    @ApiParam({ name: 'id', description: 'Article ID' })
    @ApiOkResponse({
        description: 'Updated the article successfully.',
        type: ArticleResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Article not found.' })
    @ApiBadRequestResponse({ description: 'Invalid input data.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto): Promise<Article> {
        return this.articlesService.update(+id, updateArticleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an article' })
    @ApiParam({ name: 'id', description: 'Article ID' })
    @ApiOkResponse({ description: 'Deleted the article successfully.' })
    @ApiNotFoundResponse({ description: 'Article not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        return this.articlesService.remove(+id);
    }

    @Put(':id/likes')
    @ApiOperation({ summary: 'Toggle like on an article' })
    @ApiParam({ name: 'id', description: 'Article ID' })
    @ApiOkResponse({
        description: 'Toggled article like successfully.',
        type: ArticleResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Article not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async addLike(@Param('id') id: string, @Headers('authorization') authorization: string): Promise<Article> {
        const userId = getUserIdFromToken(authorization);
        const addLikeDto: AddLikeDto = { userId: Number(userId) };
        return this.articlesService.addLike(+id, addLikeDto);
    }

    @Put(':id/views')
    @Public()
    @ApiOperation({ summary: 'Increment article views' })
    @ApiParam({ name: 'id', description: 'Article ID' })
    @ApiOkResponse({ description: 'Incremented article views successfully.' })
    @ApiNotFoundResponse({ description: 'Article not found.' })
    async incrementViews(@Param('id') id: string): Promise<any> {
        return this.articlesService.incrementViews(+id);
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark article as read' })
    @ApiParam({ name: 'id', description: 'Article ID' })
    @ApiOkResponse({
        description: 'Marked article as read successfully.',
        type: ArticleResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Article not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    @ApiBadRequestResponse({ description: 'User has not read all article content sections.' })
    async addRead(@Param('id') id: number, @Headers('authorization') authorization: string): Promise<Article | void> {
        const userId = getUserIdFromToken(authorization);
        const readUser: ReadUserArticleDto = { userId: Number(userId) };
        return this.articlesService.addRead(+id, readUser);
    }

    @Put(':id/save')
    @ApiOperation({ summary: 'Toggle save on an article' })
    @ApiParam({ name: 'id', description: 'Article ID' })
    @ApiOkResponse({
        description: 'Toggled article save successfully.',
        type: ArticleResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Article not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async addSave(@Param('id') id: number, @Headers('authorization') authorization: string): Promise<Article> {
        const userId = getUserIdFromToken(authorization);
        const saveUser: SaveUserArticleDto = { userId: Number(userId) };
        return this.articlesService.addSave(+id, saveUser);
    }
}
