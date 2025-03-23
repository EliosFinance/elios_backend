import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
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
import { Public } from '../../auth/decorator/public.decorator';
import {
    ArticleCategoryResponseDto,
    CreateArticleCategoryDto,
    UpdateArticleCategoryDto,
} from '../dto/article-category-dtos';
import { ArticleCategory } from '../entities/article-category-entity';
import { ArticleCategoryService } from '../services/article-category-service';

@ApiTags('Article Categories')
@Controller('article-category')
export class ArticleCategoryController {
    constructor(private readonly articleCategoryService: ArticleCategoryService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new article category' })
    @ApiCreatedResponse({
        description: 'The article category has been successfully created.',
        type: ArticleCategoryResponseDto,
    })
    @ApiBadRequestResponse({ description: 'Invalid input data.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async create(@Body() createArticleCategoryDto: CreateArticleCategoryDto): Promise<ArticleCategory> {
        return this.articleCategoryService.create(createArticleCategoryDto);
    }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Get all article categories' })
    @ApiOkResponse({
        description: 'Retrieved all article categories successfully.',
        type: [ArticleCategoryResponseDto],
    })
    async findAll(): Promise<ArticleCategory[]> {
        return this.articleCategoryService.findAll();
    }

    @Get(':id')
    @Public()
    @ApiOperation({ summary: 'Get an article category by ID' })
    @ApiParam({ name: 'id', description: 'Article Category ID' })
    @ApiOkResponse({
        description: 'Retrieved the article category successfully.',
        type: ArticleCategoryResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Article category not found.' })
    async findOne(@Param('id') id: string): Promise<ArticleCategory> {
        return this.articleCategoryService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update an article category' })
    @ApiParam({ name: 'id', description: 'Article Category ID' })
    @ApiOkResponse({
        description: 'Updated the article category successfully.',
        type: ArticleCategoryResponseDto,
    })
    @ApiNotFoundResponse({ description: 'Article category not found.' })
    @ApiBadRequestResponse({ description: 'Invalid input data.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    async update(
        @Param('id') id: string,
        @Body() updateArticleCategoryDto: UpdateArticleCategoryDto,
    ): Promise<ArticleCategory> {
        return this.articleCategoryService.update(+id, updateArticleCategoryDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an article category' })
    @ApiParam({ name: 'id', description: 'Article Category ID' })
    @ApiOkResponse({ description: 'Deleted the article category successfully.' })
    @ApiNotFoundResponse({ description: 'Article category not found.' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        return this.articleCategoryService.remove(+id);
    }
}
