import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateQuestionDto } from './dto/question/create-question-dto';
import { UpdateQuestionDto } from './dto/question/update-question.dto';
import { CreateQuestionOptionDto } from './dto/questionOption/create-questionOption.dto';
import { CreateQuizzDto } from './dto/quizz/create-quizz.dto';
import { UpdateQuizzDto } from './dto/quizz/update-quizz.dto';
import { QuizzUserLightType } from './dto/user-light.dto';
import { QuestionOption } from './entities/question-option.entity';
import { Question } from './entities/question.entity';
import { QuestionTypesEnum, Quizz } from './entities/quizz.entity';

@Injectable()
export class QuizzService {
    constructor(
        @InjectRepository(Quizz)
        private readonly quizzRepository: Repository<Quizz>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(QuestionOption)
        private readonly questionOptionRepository: Repository<QuestionOption>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private async getOrThrow<T>(repo: Repository<T>, id: number, name = 'Entity'): Promise<T> {
        const entity = await repo.findOne({ where: { id } as any });
        if (!entity) {
            throw new NotFoundException(`${name} with ID ${id} not found`);
        }
        return entity;
    }

    // Quizz
    async create(createQuizzDto: CreateQuizzDto) {
        const newEnterprise = this.quizzRepository.create({
            ...createQuizzDto,
            challenge: { id: createQuizzDto.challengeId },
            relatedArticles: createQuizzDto.relatedArticles.map((id) => ({ id })),
            finishers: createQuizzDto.finishers.map((id) => ({ id })),
        });

        return this.quizzRepository.save(newEnterprise);
    }

    async findAll() {
        return this.quizzRepository.find({ relations: ['challenge', 'relatedArticles', 'questions', 'finishers'] });
    }

    async findOne(id: number) {
        // return the quizz with the given id, including its challenge, related articles, and questions, and the questions options
        const quizz = await this.quizzRepository.findOne({
            where: { id },
            relations: ['challenge', 'relatedArticles', 'questions', 'questions.options', 'finishers'],
        });
        if (!quizz) {
            throw new NotFoundException(`Quizz with ID ${id} not found`);
        }

        return quizz;
    }

    async update(id: number, updateQuizzDto: UpdateQuizzDto) {
        const quizz = await this.getOrThrow(this.quizzRepository, id, 'Quizz');

        Object.assign(quizz, updateQuizzDto);
        return this.quizzRepository.save(quizz);
    }

    async completeQuizz(id: number, userId: number, score: number) {
        const quizz = await this.getOrThrow(this.quizzRepository, id, 'Quizz');
        if (score > quizz.questions.length) {
            throw new BadRequestException(
                `Score ${score} is greater than the number of questions ${quizz.questions.length}`,
            );
        }
        const user = await this.getOrThrow(this.userRepository, userId, 'User');
        const finishers = quizz.finishers || [];
        const userLight: QuizzUserLightType = {
            id: user.id,
            username: user.username,
            email: user.email,
            lastScore: score,
        };

        // check if the user is already in the finishers list
        const userIndex = finishers.findIndex((finisher) => finisher.id === userLight.id);
        if (userIndex !== -1) {
            finishers[userIndex].lastScore = score;
        } else {
            finishers.push(userLight);
        }
        quizz.finishers = finishers;

        await this.quizzRepository.update(id, quizz);
        const updatedQuizz = await this.quizzRepository.findOne({
            where: { id },
            relations: ['challenge', 'relatedArticles', 'questions', 'questions.options', 'finishers'],
        });
        if (!updatedQuizz) {
            throw new NotFoundException(`Quizz with ID ${id} not found`);
        }

        return updatedQuizz;
    }

    async remove(id: number) {
        const quizz = await this.getOrThrow(this.quizzRepository, id, 'Quizz');

        return this.quizzRepository.remove(quizz);
    }

    async createQuestion(createQuestionDto: CreateQuestionDto) {
        const quizz = await this.quizzRepository.findOne({ where: { id: createQuestionDto.quizzId } });
        if (!quizz) {
            throw new NotFoundException(`Quizz with ID ${createQuestionDto.quizzId} not found`);
        }
        const options = createQuestionDto.options.map((optionId) => ({ id: optionId }));

        const questionOptions = await this.questionOptionRepository.find({
            where: { id: In(options.map((option) => option.id)) },
        });
        if (questionOptions.length !== options.length) {
            throw new NotFoundException(`Some question options not found`);
        }

        const question = this.questionRepository.create({
            ...createQuestionDto,
            quizz,
            options,
            type: createQuestionDto.type as QuestionTypesEnum,
        });

        return this.questionRepository.save(question);
    }

    async findAllQuestions() {
        return this.questionRepository.find({ relations: ['quizz', 'options'] });
    }

    async findOneQuestion(id: number) {
        const question = await this.questionRepository.findOne({ where: { id }, relations: ['quizz', 'options'] });
        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }
        return question;
    }

    async updateQuestion(id: number, updateQuestionDto: UpdateQuestionDto) {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }
        Object.assign(question, updateQuestionDto);
        return this.questionRepository.save(question);
    }

    async removeQuestion(id: number) {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question) {
            throw new NotFoundException(`Question with ID ${id} not found`);
        }
        return this.questionRepository.remove(question);
    }

    // Question Options
    async createQuestionOption(createQuestionOptionDto: CreateQuestionOptionDto) {
        const question = await this.questionRepository.findOne({ where: { id: createQuestionOptionDto.questionId } });
        if (!question) {
            throw new NotFoundException(`Question with ID ${createQuestionOptionDto.questionId} not found`);
        }

        const option = this.questionOptionRepository.create({
            ...createQuestionOptionDto,
            question,
            isCorrect: createQuestionOptionDto.isCorrect ? 'true' : 'false',
        });

        return this.questionOptionRepository.save(option);
    }

    async findAllQuestionOptions() {
        return this.questionOptionRepository.find({ relations: ['question'] });
    }

    async findOneQuestionOption(id: number) {
        const questionOption = await this.questionOptionRepository.findOne({ where: { id }, relations: ['question'] });
        if (!questionOption) {
            throw new NotFoundException(`Question Option with ID ${id} not found`);
        }
        return questionOption;
    }

    async updateQuestionOption(id: number, updateQuestionOptionDto: any) {
        const questionOption = await this.questionOptionRepository.findOne({ where: { id } });
        if (!questionOption) {
            throw new NotFoundException(`Question Option with ID ${id} not found`);
        }
        Object.assign(questionOption, updateQuestionOptionDto);
        return this.questionOptionRepository.save(questionOption);
    }

    async removeQuestionOption(id: number) {
        const questionOption = await this.questionOptionRepository.findOne({ where: { id } });
        if (!questionOption) {
            throw new NotFoundException(`Question Option with ID ${id} not found`);
        }
        return this.questionOptionRepository.remove(questionOption);
    }
}
