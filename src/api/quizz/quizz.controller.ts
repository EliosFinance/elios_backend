import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateQuestionDto } from './dto/question/create-question-dto';
import { UpdateQuestionDto } from './dto/question/update-question.dto';
import { CreateQuestionOptionDto } from './dto/questionOption/create-questionOption.dto';
import { UpdateQuestionOptionDto } from './dto/questionOption/update-questionOption.dto';
import { CreateQuizzDto } from './dto/quizz/create-quizz.dto';
import { UpdateQuizzDto } from './dto/quizz/update-quizz.dto';
import { QuizzService } from './quizz.service';

@Controller('quizz')
@ApiTags('Quizz')
export class QuizzController {
    constructor(private readonly quizzService: QuizzService) {}

    @Post()
    create(@Body() createQuizzDto: CreateQuizzDto) {
        return this.quizzService.create(createQuizzDto);
    }

    @Get()
    findAll() {
        return this.quizzService.findAll();
    }

    @Get('questions')
    findAllQuestions() {
        console.log('aaaaaa');

        return this.quizzService.findAllQuestions();
    }

    @Get('question-options')
    findAllQuestionOptions() {
        return this.quizzService.findAllQuestionOptions();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.quizzService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateQuizzDto: UpdateQuizzDto) {
        return this.quizzService.update(+id, updateQuizzDto);
    }

    @Put(':id/complete')
    completeQuizz(@Param('id') id: string, @Body('score') score: number, @UserFromRequest() user: User) {
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.id) {
            throw new Error('User ID not found');
        }
        if (!score) {
            throw new Error('Score not found');
        }
        return this.quizzService.completeQuizz(+id, user.id, score);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.quizzService.remove(+id);
    }

    // -- QUESTIONS --
    @Post('questions')
    createQuestion(@Body() dto: CreateQuestionDto) {
        return this.quizzService.createQuestion(dto);
    }

    @Patch('questions/:id')
    updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
        return this.quizzService.updateQuestion(+id, dto);
    }

    @Delete('questions/:id')
    removeQuestion(@Param('id') id: string) {
        return this.quizzService.removeQuestion(+id);
    }

    @Post('question-options')
    createQuestionOption(@Body() dto: CreateQuestionOptionDto) {
        return this.quizzService.createQuestionOption(dto);
    }

    @Get('question-options/:id')
    findOneQuestionOption(@Param('id') id: string) {
        return this.quizzService.findOneQuestionOption(+id);
    }

    @Patch('question-options/:id')
    updateQuestionOption(@Param('id') id: string, @Body() dto: UpdateQuestionOptionDto) {
        return this.quizzService.updateQuestionOption(+id, dto);
    }

    @Delete('question-options/:id')
    removeQuestionOption(@Param('id') id: string) {
        return this.quizzService.removeQuestionOption(+id);
    }
}
