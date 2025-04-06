import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getUserIdFromToken } from '../../../helpers/jwt/extractJwt';
import { Public } from '../../auth/decorator/public.decorator';
import {
    CreateArticleContentDto,
    ReadUserDto,
    SaveUserDto,
    UpdateArticleContentDto,
} from '../dto/article-content-dtos';
import { ArticleContent } from '../entities/article-content-entity';
import { ArticleContentService } from '../services/article-content-service';

@ApiTags('Article Content')
@Controller('article-content')
export class ArticleContentController {
    constructor(private readonly articleContentService: ArticleContentService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new article content section' })
    @ApiCreatedResponse({
        description: 'The article content has been successfully created.',
        type: ArticleContent,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async create(@Body() createArticleContentDto: CreateArticleContentDto): Promise<ArticleContent> {
        return this.articleContentService.create(createArticleContentDto);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all article content sections' })
    @ApiQuery({
        name: 'type',
        required: false,
        description: 'Filter by content type',
    })
    @ApiOkResponse({
        description: 'Retrieved all article content sections successfully.',
        type: [ArticleContent],
    })
    async findAll(@Query('type') type?: string): Promise<ArticleContent[]> {
        return this.articleContentService.findAll(type);
    }

    @Get('userSaved')
    @ApiOperation({ summary: 'Get content sections saved by the current user' })
    @ApiOkResponse({
        description: 'Retrieved user saved content sections successfully.',
        type: [ArticleContent],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async userSaved(@Headers('authorization') authorization: string): Promise<ArticleContent[]> {
        const userId = getUserIdFromToken(authorization);
        return this.articleContentService.userSaved(userId);
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get an article content section by ID' })
    @ApiParam({ name: 'id', description: 'Article Content ID' })
    @ApiOkResponse({
        description: 'Retrieved the article content section successfully.',
        type: ArticleContent,
    })
    @ApiNotFoundResponse({ description: 'Article content section not found.' })
    async findOne(@Param('id') id: number): Promise<ArticleContent> {
        return this.articleContentService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an article content section' })
    @ApiParam({ name: 'id', description: 'Article Content ID' })
    @ApiOkResponse({
        description: 'Updated the article content section successfully.',
        type: ArticleContent,
    })
    @ApiNotFoundResponse({ description: 'Article content section not found.' })
    @ApiBadRequestResponse({ description: 'Invalid input data.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async update(
        @Param('id') id: number,
        @Body() updateArticleContentDto: UpdateArticleContentDto,
    ): Promise<ArticleContent> {
        return this.articleContentService.update(+id, updateArticleContentDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an article content section' })
    @ApiParam({ name: 'id', description: 'Article Content ID' })
    @ApiOkResponse({ description: 'Deleted the article content section successfully.' })
    @ApiNotFoundResponse({ description: 'Article content section not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: number): Promise<void> {
        return this.articleContentService.remove(+id);
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Toggle read status on an article content section' })
    @ApiParam({ name: 'id', description: 'Article Content ID' })
    @ApiOkResponse({
        description: 'Toggled read status successfully.',
        type: ArticleContent,
    })
    @ApiNotFoundResponse({ description: 'Article content section not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async addRead(@Param('id') id: number, @Headers('authorization') authorization: string): Promise<ArticleContent> {
        const userId = getUserIdFromToken(authorization);
        const readUser: ReadUserDto = { userId: Number(userId) };
        return this.articleContentService.addRead(+id, readUser);
    }

    @Put(':id/save')
    @ApiOperation({ summary: 'Toggle save status on an article content section' })
    @ApiParam({ name: 'id', description: 'Article Content ID' })
    @ApiOkResponse({
        description: 'Toggled save status successfully.',
        type: ArticleContent,
    })
    @ApiNotFoundResponse({ description: 'Article content section not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async addSave(@Param('id') id: number, @Headers('authorization') authorization: string): Promise<ArticleContent> {
        const userId = getUserIdFromToken(authorization);
        const saveUser: SaveUserDto = { userId: Number(userId) };
        return this.articleContentService.addSave(+id, saveUser);
    }
}
