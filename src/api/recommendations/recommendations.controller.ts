// src/api/recommendations/recommendations.controller.ts - VERSION CORRIGÉE

import { Controller, Get, HttpException, HttpStatus, Logger, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserPreferences, UserPreferencesService } from '../users/user-preferences.service';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RecommendationsController {
    private readonly logger = new Logger(RecommendationsController.name);

    constructor(
        private readonly userPreferencesService: UserPreferencesService,
        private readonly recommendationsService: RecommendationsService,
    ) {}

    @Get('preferences')
    @ApiOperation({ summary: 'Get user preferences analysis' })
    @ApiQuery({
        name: 'daysBack',
        required: false,
        type: Number,
        description: 'Number of days to analyze (default: 30, max: 365)',
    })
    @ApiResponse({
        status: 200,
        description: 'User preferences successfully analyzed',
    })
    async getUserPreferences(
        @UserFromRequest() user: User,
        @Query('daysBack') daysBackQuery?: string, // Recevoir comme string
    ): Promise<UserPreferences> {
        try {
            this.logger.log(`Demande d'analyse des préférences pour l'utilisateur ${user.id}`);

            // Validation de l'utilisateur
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            // CORRECTION : Conversion et validation sécurisée de daysBack
            let daysBack = 30; // Valeur par défaut
            if (daysBackQuery !== undefined) {
                const parsed = parseInt(daysBackQuery, 10);
                if (isNaN(parsed) || parsed < 1 || parsed > 365) {
                    this.logger.warn(
                        `Paramètre daysBack invalide: ${daysBackQuery}. Utilisation de la valeur par défaut (30).`,
                    );
                    daysBack = 30;
                } else {
                    daysBack = parsed;
                }
            }

            this.logger.log(`Analyse sur ${daysBack} jours pour l'utilisateur ${user.id}`);

            const preferences = await this.userPreferencesService.analyzeUserPreferences(user.id, daysBack);

            this.logger.log(`Préférences récupérées avec succès pour l'utilisateur ${user.id}`);
            return preferences;
        } catch (error) {
            this.logger.error(
                `Erreur lors de la récupération des préférences pour l'utilisateur ${user?.id}: ${error.message}`,
                error.stack,
            );

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                "Erreur interne lors de l'analyse des préférences",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('content')
    @ApiOperation({ summary: 'Get personalized content recommendations' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Maximum number of items to return (default: 10, max: 50)',
    })
    @ApiResponse({
        status: 200,
        description: 'Personalized recommendations successfully generated',
    })
    async getPersonalizedContent(
        @UserFromRequest() user: User,
        @Query('limit') limitQuery?: string, // Recevoir comme string
    ) {
        try {
            this.logger.log(`Demande de recommandations pour l'utilisateur ${user.id}`);

            // Validation de l'utilisateur
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            // CORRECTION : Conversion et validation sécurisée de limit
            let limit = 10; // Valeur par défaut
            if (limitQuery !== undefined) {
                const parsed = parseInt(limitQuery, 10);
                if (isNaN(parsed) || parsed < 1) {
                    this.logger.warn(
                        `Paramètre limit invalide: ${limitQuery}. Utilisation de la valeur par défaut (10).`,
                    );
                    limit = 10;
                } else if (parsed > 50) {
                    this.logger.warn(`Paramètre limit trop élevé: ${limitQuery}. Limitation à 50.`);
                    limit = 50;
                } else {
                    limit = parsed;
                }
            }

            this.logger.log(`Génération de ${limit} recommandations pour l'utilisateur ${user.id}`);

            const recommendations = await this.userPreferencesService.getPersonalizedRecommendations(user.id, limit);

            // Ajouter des métadonnées utiles
            const result = {
                ...recommendations,
                algorithm: 'content-based',
                explanation: 'Recommandations basées sur vos préférences de contenu',
                userId: user.id,
                generatedAt: new Date(),
                totalCount:
                    recommendations.articles.length + recommendations.challenges.length + recommendations.quizz.length,
                requestedLimit: limit,
            };

            this.logger.log(
                `Recommandations générées avec succès pour l'utilisateur ${user.id}: ${result.totalCount} éléments`,
            );
            return result;
        } catch (error) {
            this.logger.error(
                `Erreur lors de la génération des recommandations pour l'utilisateur ${user?.id}: ${error.message}`,
                error.stack,
            );

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Erreur interne lors de la génération des recommandations',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('insights')
    @ApiOperation({ summary: 'Get detailed user behavior insights' })
    @ApiResponse({
        status: 200,
        description: 'User insights successfully generated',
    })
    async getUserInsights(@UserFromRequest() user: User) {
        try {
            this.logger.log(`Demande d'insights pour l'utilisateur ${user.id}`);

            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            const preferences = await this.userPreferencesService.analyzeUserPreferences(user.id);

            const insights = {
                summary: this.recommendationsService.generateUserSummary(preferences),
                recommendations: this.recommendationsService.generateRecommendationText(preferences),
                trends: [], // Sera implémenté plus tard
            };

            const result = {
                preferences,
                insights,
                generatedAt: new Date(),
            };

            this.logger.log(`Insights générés avec succès pour l'utilisateur ${user.id}`);
            return result;
        } catch (error) {
            this.logger.error(
                `Erreur lors de la génération des insights pour l'utilisateur ${user?.id}: ${error.message}`,
                error.stack,
            );

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Erreur interne lors de la génération des insights',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
