import { Controller, Get, HttpException, HttpStatus, Logger, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { UserPreferencesType } from '@src/types/recommendationsTypes';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserPreferencesService } from '../users/user-preferences.service';
import { UserSpendingsService } from '../users/user-spendings.service';
import { RecommendationsSpendingsService } from './recommendations-spendings.service';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RecommendationsController {
    private readonly logger = new Logger(RecommendationsController.name);

    constructor(
        private readonly userPreferencesService: UserPreferencesService,
        private readonly userSpendingsService: UserSpendingsService,
        private readonly recommendationsSpendingsService: RecommendationsSpendingsService,
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
    async getUserPreferences(
        @UserFromRequest() user: User,
        @Query('daysBack') daysBackQuery?: string,
    ): Promise<UserPreferencesType> {
        try {
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            let daysBack = 30;
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

            return await this.userPreferencesService.analyzeUserPreferences(user.id, daysBack);
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
    async getPersonalizedContent(@UserFromRequest() user: User, @Query('limit') limitQuery?: string) {
        try {
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

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

            const recommendations = await this.userPreferencesService.getPersonalizedRecommendations(user, limit);

            return {
                ...recommendations,
                algorithm: 'content-based',
                explanation: 'Recommandations basées sur vos préférences de contenu',
                userId: user.id,
                generatedAt: new Date(),
                totalCount:
                    recommendations.articles.length + recommendations.challenges.length + recommendations.quizz.length,
                requestedLimit: limit,
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
    async getUserInsights(@UserFromRequest() user: User) {
        try {
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            const preferences = await this.userPreferencesService.analyzeUserPreferences(user.id);

            const insights = {
                summary: this.recommendationsService.generateUserSummary(preferences),
                recommendations: this.recommendationsService.generateRecommendationText(preferences),
                trends: [], // TODO: Implement trend analysis
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

    @Get('financial-score')
    @ApiOperation({ summary: 'Get user financial health score' })
    async getFinancialScore(@UserFromRequest() user: User) {
        try {
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            const preferences = await this.userSpendingsService.analyzeUserPreferences(user);
            const score = this.recommendationsSpendingsService.calculateFinancialScore(preferences);

            let level = 'Débutant';
            if (score >= 80) level = 'Expert';
            else if (score >= 65) level = 'Avancé';
            else if (score >= 45) level = 'Intermédiaire';

            const breakdown = {
                savingsRate: preferences.financialProfile.savingsRate,
                categoryDiversification: preferences.financialProfile.topCategories.length,
                riskFactors: preferences.recommendations.riskAreas.length,
                budgetOptimization: preferences.recommendations.budgetOptimization.length,
            };

            const improvements = [];
            if (preferences.financialProfile.savingsRate < 10) {
                improvements.push("Augmentez votre taux d'épargne à au moins 10%");
            }
            if (preferences.recommendations.riskAreas.length > 0) {
                improvements.push('Adressez les zones de risque identifiées');
            }
            if (preferences.recommendations.budgetOptimization.length > 2) {
                improvements.push('Optimisez votre budget selon les recommandations');
            }

            return {
                score,
                level,
                breakdown,
                improvements,
                generatedAt: new Date(),
            };
        } catch (error) {
            this.logger.error(
                `Erreur lors du calcul du score financier pour l'utilisateur ${user?.id}: ${error.message}`,
                error.stack,
            );

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Erreur interne lors du calcul du score financier',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get('spending-analysis')
    @ApiOperation({ summary: 'Get detailed spending analysis and forecasts' })
    @ApiQuery({
        name: 'period',
        required: false,
        type: String,
        description: 'Analysis period: week, month, quarter, year (default: month)',
    })
    async getSpendingAnalysis(@UserFromRequest() user: User, @Query('period') period: string = 'month') {
        try {
            if (!user || !user.id) {
                throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
            }

            const daysBack = this.getPeriodDays(period);
            const preferences = await this.userSpendingsService.analyzeUserPreferences(user, daysBack);

            const monthlyData = preferences.financialProfile.monthlyTrend;
            let forecast = null;

            if (monthlyData.length >= 2) {
                const lastMonth = monthlyData[monthlyData.length - 1];
                const previousMonth = monthlyData[monthlyData.length - 2];

                const expensesTrend = ((lastMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100;
                const incomeTrend = ((lastMonth.income - previousMonth.income) / previousMonth.income) * 100;

                forecast = {
                    nextMonthExpenses: lastMonth.expenses * (1 + expensesTrend / 100),
                    nextMonthIncome: lastMonth.income * (1 + incomeTrend / 100),
                    trend: expensesTrend > 5 ? 'increasing' : expensesTrend < -5 ? 'decreasing' : 'stable',
                };
            }

            return {
                period,
                analysis: {
                    totalExpenses: preferences.financialProfile.totalExpenses,
                    totalIncome: preferences.financialProfile.totalIncome,
                    savingsRate: preferences.financialProfile.savingsRate,
                    topCategories: preferences.financialProfile.topCategories,
                    monthlyTrend: monthlyData,
                    spendingPatterns: preferences.spendingPatterns,
                },
                forecast,
                insights: this.recommendationsSpendingsService.generateAdvancedInsights(preferences),
                generatedAt: new Date(),
            };
        } catch (error) {
            this.logger.error(
                `Erreur lors de l'analyse des dépenses pour l'utilisateur ${user?.id}: ${error.message}`,
                error.stack,
            );

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException("Erreur interne lors de l'analyse des dépenses", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private getPeriodDays(period: string): number {
        switch (period.toLowerCase()) {
            case 'week':
                return 7;
            case 'month':
                return 30;
            case 'quarter':
                return 90;
            case 'year':
                return 365;
            default:
                return 30;
        }
    }
}
