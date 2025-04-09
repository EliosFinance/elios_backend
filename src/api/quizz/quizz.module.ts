import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { QuestionOption } from './entities/question-option.entity';
import { Question } from './entities/question.entity';
import { QuizzFinisher } from './entities/quizz-finisher';
import { Quizz } from './entities/quizz.entity';
import { QuizzController } from './quizz.controller';
import { QuizzService } from './quizz.service';

@Module({
    imports: [TypeOrmModule.forFeature([Quizz, Question, QuestionOption, QuizzFinisher, User])],
    controllers: [QuizzController],
    providers: [QuizzService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class QuizzModule {}
