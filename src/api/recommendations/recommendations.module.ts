import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Challenge } from '../challenges/entities/challenge.entity';
import { Connector } from '../powens/entities/connector.entity';
import { PowensService } from '../powens/powens.service';
import { Quizz } from '../quizz/entities/quizz.entity';
import { RequestLog } from '../request-logs/entities/request-log.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { UserNotifications } from '../users/entities/user-notifications.entity';
import { User } from '../users/entities/user.entity';
import { UserPreferencesService } from '../users/user-preferences.service';
import { UserSpendingsService } from '../users/user-spendings.service';
import { UsersService } from '../users/users.service';
import { RecommendationsSpendingsService } from './recommendations-spendings.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([
            RequestLog,
            User,
            Article,
            Challenge,
            Quizz,
            Transaction,
            Connector,
            UserNotifications,
        ]),
    ],
    controllers: [RecommendationsController],
    providers: [
        RecommendationsSpendingsService,
        RecommendationsService,
        UserPreferencesService,
        UserSpendingsService,
        UsersService,
        PowensService,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
    exports: [UserPreferencesService, UserSpendingsService, RecommendationsService, RecommendationsSpendingsService],
})
export class RecommendationsModule {}
