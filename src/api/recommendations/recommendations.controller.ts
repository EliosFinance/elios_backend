// src/api/recommendations/recommendations.controller.ts
import { Controller, Get, HttpException, HttpStatus, Logger, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { UserPreferencesType } from '@src/types/recommendationsTypes';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserPreferencesService } from '../users/user-preferences.service';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RecommendationsController {
    private readonly logger = new Logger(RecommendationsController.name);

    constructor(private readonly userPreferencesService: UserPreferencesService) {}

    @Get('preferences')
    @ApiOperation({ summary: 'Get user preferences analysis' })
    @ApiQuery({
        name: 'daysBack',
        required: false,
        type: Number,
        description: 'Number of days to analyze (default: 30)',
    })
    @ApiResponse({
        status: 200,
        description: 'User preferences successfully analyzed',
    })
    async getUserPreferences(
        @UserFromRequest() user: User,
        @Query('daysBack') daysBack: number = 30,
    ): Promise<UserPreferencesType> {
        try {
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            if (daysBack && (daysBack < 1 || daysBack > 365)) {
                throw new HttpException('Le paramètre daysBack doit être entre 1 et 365', HttpStatus.BAD_REQUEST);
            }

            const preferences = await this.userPreferencesService.analyzeUserPreferences(user.id, daysBack);

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
        description: 'Maximum number of items to return (default: 10)',
    })
    @ApiResponse({
        status: 200,
        description: 'Personalized recommendations successfully generated',
    })
    async getPersonalizedContent(@UserFromRequest() user: User, @Query('limit') limit: number = 10) {
        try {
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            if (limit && (limit < 1 || limit > 50)) {
                throw new HttpException('Le paramètre limit doit être entre 1 et 50', HttpStatus.BAD_REQUEST);
            }

            const recommendations = await this.userPreferencesService.getPersonalizedRecommendations(user.id, limit);

            return {
                ...recommendations,
                algorithm: 'content-based',
                explanation: 'Recommandations basées sur vos préférences de contenu',
                userId: user.id,
                generatedAt: new Date(),
                totalCount:
                    recommendations.articles.length + recommendations.challenges.length + recommendations.quizz.length,
            };
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
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            const preferences = await this.userPreferencesService.analyzeUserPreferences(user.id);

            const insights = {
                summary: this.generateUserSummary(preferences),
                recommendations: this.generateRecommendationText(preferences),
                trends: [], // TODO: Ajouter une méthode pour générer des tendances basées sur les préférences
            };

            return {
                preferences,
                insights,
                generatedAt: new Date(),
            };
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

    private generateUserSummary(preferences: UserPreferencesType): string {
        try {
            const topCategory = preferences.favoriteCategories[0];
            const topContentType = preferences.contentTypes[0];

            if (!topCategory || !topContentType) {
                return 'Nous collectons encore des données sur vos préférences. Continuez à explorer notre contenu !';
            }

            return (
                `Vous montrez un fort intérêt pour ${topCategory.category.toLowerCase()} ` +
                `et préférez interagir avec ${topContentType.type}. ` +
                `Votre niveau de difficulté préféré est ${preferences.difficultyLevel}. ` +
                `Score d'activité: ${Math.round(preferences.activityScore)}/100.`
            );
        } catch (error) {
            this.logger.warn(`Erreur lors de la génération du résumé: ${error.message}`);
            return "Profil en cours d'analyse.";
        }
    }

    private generateRecommendationText(preferences: UserPreferencesType): string[] {
        try {
            const recommendations = [];

            if (preferences.activityScore < 30) {
                recommendations.push(
                    "Essayez de consulter du contenu plus régulièrement pour améliorer votre expérience d'apprentissage.",
                );
            }

            if (preferences.favoriteCategories.length > 0) {
                const topCategory = preferences.favoriteCategories[0];
                recommendations.push(
                    `Basé sur votre intérêt pour ${topCategory.category}, nous vous recommandons d'explorer des sujets connexes.`,
                );
            }

            if (preferences.difficultyLevel === 'easy') {
                recommendations.push('Vous pourriez essayer des contenus de difficulté moyenne pour progresser.');
            }

            return recommendations;
        } catch (error) {
            this.logger.warn(`Erreur lors de la génération des recommandations textuelles: ${error.message}`);
            return ['Continuez à explorer notre contenu pour recevoir des recommandations personnalisées.'];
        }
    }
}
