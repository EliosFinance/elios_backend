// src/api/recommendations/recommendations.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Challenge } from '../challenges/entities/challenge.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { RequestLog } from '../request-logs/entities/request-log.entity';
import { User } from '../users/entities/user.entity';
import { UserPreferencesService } from '../users/user-preferences.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
    imports: [TypeOrmModule.forFeature([RequestLog, User, Article, Challenge, Quizz])],
    controllers: [RecommendationsController],
    providers: [RecommendationsService, UserPreferencesService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
    exports: [UserPreferencesService],
})
export class RecommendationsModule {}
