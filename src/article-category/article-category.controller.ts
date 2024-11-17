import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ArticleCategoryService } from './article-category.service';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';
import { UpdateArticleCategoryDto } from './dto/update-article-category.dto';

@Controller('article-category')
export class ArticleCategoryController {
    constructor(private readonly articleCategoryService: ArticleCategoryService) {}

    @Post()
    create(@Body() createArticleCategoryDto: CreateArticleCategoryDto) {
        return this.articleCategoryService.create(createArticleCategoryDto);
    }

    @Get()
    findAll() {
        return this.articleCategoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.articleCategoryService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateArticleCategoryDto: UpdateArticleCategoryDto) {
        return this.articleCategoryService.update(+id, updateArticleCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.articleCategoryService.remove(+id);
    }
}
