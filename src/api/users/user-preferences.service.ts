import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    CategoryPreferenceType,
    ContentTypePreferenceType,
    UserPreferencesType,
} from '@src/types/recommendationsTypes';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { Quizz, QuizzDifficultyEnum } from '../quizz/entities/quizz.entity';
import { RequestLog } from '../request-logs/entities/request-log.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserPreferencesService {
    private readonly logger = new Logger(UserPreferencesService.name);

    constructor(
        @InjectRepository(RequestLog)
        private readonly requestLogRepository: Repository<RequestLog>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
        @InjectRepository(Quizz)
        private readonly quizzRepository: Repository<Quizz>,
    ) {}

    async analyzeUserPreferences(userId: number, daysBack: number = 30): Promise<UserPreferencesType> {
        try {
            const validatedUserId = this.validateUserId(userId);
            const validatedDaysBack = this.validateDaysBack(daysBack);

            this.logger.log(
                `Analyse des préférences pour l'utilisateur ${validatedUserId} sur ${validatedDaysBack} jours`,
            );

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - validatedDaysBack);

            if (isNaN(cutoffDate.getTime())) {
                throw new Error(`Date invalide calculée avec daysBack: ${validatedDaysBack}`);
            }

            let userLogs: RequestLog[] = [];
            try {
                userLogs = await this.requestLogRepository.find({
                    where: {
                        userId: validatedUserId,
                        timestamp: MoreThanOrEqual(cutoffDate),
                        statusCode: 200,
                    },
                    order: { timestamp: 'DESC' },
                    take: 1000,
                });
                this.logger.log(`Trouvé ${userLogs.length} logs pour l'utilisateur ${validatedUserId}`);
            } catch (error) {
                this.logger.error(`Erreur lors de la récupération des logs: ${error.message}`);
            }

            const categoryAnalysis = await this.analyzeCategoryPreferences(validatedUserId, userLogs);
            const contentTypeAnalysis = this.analyzeContentTypePreferences(userLogs);
            const difficultyLevel = await this.analyzeDifficultyPreference(validatedUserId, userLogs);
            const activityScore = this.calculateActivityScore(userLogs, validatedDaysBack);

            const preferences: UserPreferencesType = {
                userId: validatedUserId,
                favoriteCategories: categoryAnalysis,
                contentTypes: contentTypeAnalysis,
                difficultyLevel,
                activityScore,
                lastAnalyzed: new Date(),
            };

            this.logger.log(`Analyse terminée pour l'utilisateur ${validatedUserId}`);
            return preferences;
        } catch (error) {
            this.logger.error(
                `Erreur lors de l'analyse des préférences pour l'utilisateur ${userId}: ${error.message}`,
                error.stack,
            );

            return this.getDefaultPreferences(userId);
        }
    }

    async getPersonalizedRecommendations(
        user: User,
        limit: number = 10,
    ): Promise<{
        articles: Article[];
        challenges: Challenge[];
        quizz: Quizz[];
    }> {
        try {
            const { id: userId } = user;
            const validatedUserId = this.validateUserId(userId);
            const validatedLimit = this.validateLimit(limit);

            this.logger.log(
                `Génération de recommandations pour l'utilisateur ${validatedUserId} (limite: ${validatedLimit})`,
            );

            const preferences = await this.analyzeUserPreferences(validatedUserId);
            const topCategories = preferences.favoriteCategories.slice(0, 3).map((cat) => cat.category);

            this.logger.log(`Top catégories: ${topCategories.join(', ')}`);

            const articlesLimit = Math.max(1, Math.floor(validatedLimit * 0.4)); // Au moins 1
            const challengesLimit = Math.max(1, Math.floor(validatedLimit * 0.3)); // Au moins 1
            const quizzLimit = Math.max(1, Math.floor(validatedLimit * 0.3)); // Au moins 1

            this.logger.log(
                `Limites calculées - Articles: ${articlesLimit}, Défis: ${challengesLimit}, Quizz: ${quizzLimit}`,
            );

            // Articles
            let recommendedArticles: Article[] = [];
            try {
                if (topCategories.length > 0) {
                    recommendedArticles = await this.articleRepository.find({
                        where: {
                            category: {
                                title: In(topCategories),
                            },
                        },
                        relations: ['category', 'authors'],
                        take: articlesLimit,
                        order: { creation_date: 'DESC' },
                    });
                } else {
                    recommendedArticles = await this.articleRepository.find({
                        relations: ['category', 'authors'],
                        take: articlesLimit,
                        order: { creation_date: 'DESC' },
                    });
                }
                this.logger.log(`Trouvé ${recommendedArticles.length} articles recommandés`);
            } catch (error) {
                this.logger.error(`Erreur lors de la récupération des articles: ${error.message}`);
            }

            // Challenges
            let recommendedChallenges: Challenge[] = [];
            try {
                if (topCategories.length > 0) {
                    recommendedChallenges = await this.challengeRepository.find({
                        where: {
                            category: In(topCategories),
                        },
                        relations: ['enterprise'],
                        take: challengesLimit,
                        order: { creation_date: 'DESC' },
                    });
                } else {
                    recommendedChallenges = await this.challengeRepository.find({
                        relations: ['enterprise'],
                        take: challengesLimit,
                        order: { creation_date: 'DESC' },
                    });
                }
                this.logger.log(`Trouvé ${recommendedChallenges.length} défis recommandés`);
            } catch (error) {
                this.logger.error(`Erreur lors de la récupération des défis: ${error.message}`);
            }

            // Quizz
            let recommendedQuizz: Quizz[] = [];
            try {
                const mappedDifficulty = this.mapDifficultyToEnum(preferences.difficultyLevel);

                recommendedQuizz = await this.quizzRepository.find({
                    where: {
                        difficulty: mappedDifficulty,
                    },
                    relations: ['challenge'],
                    take: quizzLimit,
                    order: { id: 'DESC' },
                });
                this.logger.log(`Trouvé ${recommendedQuizz.length} quizz recommandés`);
            } catch (error) {
                this.logger.error(`Erreur lors de la récupération des quizz: ${error.message}`);
            }

            return {
                articles: recommendedArticles,
                challenges: recommendedChallenges,
                quizz: recommendedQuizz,
            };
        } catch (error) {
            this.logger.error(
                `Erreur lors de la génération des recommandations pour l'utilisateur ${user.id}: ${error.message}`,
                error.stack,
            );

            return {
                articles: [],
                challenges: [],
                quizz: [],
            };
        }
    }

    private validateUserId(userId: any): number {
        const parsed = parseInt(userId, 10);
        if (isNaN(parsed) || parsed <= 0) {
            throw new Error(`UserID invalide: ${userId}. Doit être un nombre positif.`);
        }
        return parsed;
    }

    private validateDaysBack(daysBack: any): number {
        const parsed = parseInt(daysBack, 10);
        if (isNaN(parsed) || parsed <= 0 || parsed > 365) {
            this.logger.warn(`DaysBack invalide: ${daysBack}. Utilisation de la valeur par défaut (30).`);
            return 30;
        }
        return parsed;
    }

    private validateLimit(limit: any): number {
        const parsed = parseInt(limit, 10);
        if (isNaN(parsed) || parsed <= 0) {
            this.logger.warn(`Limite invalide: ${limit}. Utilisation de la valeur par défaut (10).`);
            return 10;
        }
        if (parsed > 50) {
            this.logger.warn(`Limite trop élevée: ${limit}. Limitation à 50.`);
            return 50;
        }
        return parsed;
    }

    private mapDifficultyToEnum(difficulty: 'easy' | 'medium' | 'hard'): QuizzDifficultyEnum {
        const mapping: Record<string, QuizzDifficultyEnum> = {
            easy: QuizzDifficultyEnum.EASY,
            medium: QuizzDifficultyEnum.MEDIUM,
            hard: QuizzDifficultyEnum.HARD,
        };

        return mapping[difficulty] || QuizzDifficultyEnum.EASY;
    }

    private getDefaultPreferences(userId: number): UserPreferencesType {
        return {
            userId,
            favoriteCategories: [],
            contentTypes: [
                { type: 'articles', score: 33.33, interactionCount: 0 },
                { type: 'challenges', score: 33.33, interactionCount: 0 },
                { type: 'quizz', score: 33.33, interactionCount: 0 },
            ],
            difficultyLevel: 'easy',
            activityScore: 0,
            lastAnalyzed: new Date(),
        };
    }

    private async analyzeCategoryPreferences(_userId: number, logs: RequestLog[]): Promise<CategoryPreferenceType[]> {
        try {
            const categoryInteractions = new Map<string, number>();

            const articleViewLogs = logs.filter(
                (log) =>
                    log.url &&
                    log.url.includes('/articles/') &&
                    !log.url.includes('/articles/trendings') &&
                    !log.url.includes('/articles/userReads'),
            );

            for (const log of articleViewLogs) {
                try {
                    const articleId = this.extractIdFromUrl(log.url, '/articles/');
                    if (articleId) {
                        const article = await this.articleRepository.findOne({
                            where: { id: articleId },
                            relations: ['category'],
                        });

                        if (article?.category?.title) {
                            const count = categoryInteractions.get(article.category.title) || 0;
                            categoryInteractions.set(article.category.title, count + 1);
                        }
                    }
                } catch (error) {
                    this.logger.warn(`Erreur lors de l'analyse de l'article du log: ${error.message}`);
                }
            }

            const challengeViewLogs = logs.filter((log) => log.url && log.url.includes('/challenges/'));

            for (const log of challengeViewLogs) {
                try {
                    const challengeId = this.extractIdFromUrl(log.url, '/challenges/');
                    if (challengeId) {
                        const challenge = await this.challengeRepository.findOne({
                            where: { id: challengeId },
                        });

                        if (challenge?.category) {
                            const count = categoryInteractions.get(challenge.category) || 0;
                            categoryInteractions.set(challenge.category, count + 1);
                        }
                    }
                } catch (error) {
                    this.logger.warn(`Erreur lors de l'analyse du défi du log: ${error.message}`);
                }
            }

            const totalInteractions = Array.from(categoryInteractions.values()).reduce((sum, count) => sum + count, 0);

            const result = Array.from(categoryInteractions.entries())
                .map(([category, count]) => ({
                    category,
                    score: totalInteractions > 0 ? (count / totalInteractions) * 100 : 0,
                    interactionCount: count,
                }))
                .sort((a, b) => b.score - a.score);

            return result;
        } catch (error) {
            this.logger.error(`Erreur lors de l'analyse des catégories: ${error.message}`);
            return [];
        }
    }

    private analyzeContentTypePreferences(logs: RequestLog[]): ContentTypePreferenceType[] {
        try {
            const contentTypeInteractions = {
                articles: 0,
                challenges: 0,
                quizz: 0,
            };

            logs.forEach((log) => {
                try {
                    if (log.url) {
                        if (log.url.includes('/articles/') && !log.url.includes('/articles/trendings')) {
                            contentTypeInteractions.articles++;
                        } else if (log.url.includes('/challenges/')) {
                            contentTypeInteractions.challenges++;
                        } else if (log.url.includes('/quizz/')) {
                            contentTypeInteractions.quizz++;
                        }
                    }
                } catch (error) {
                    this.logger.warn(`Erreur lors de l'analyse du log: ${error.message}`);
                }
            });

            const total = Object.values(contentTypeInteractions).reduce((sum, count) => sum + count, 0);

            return Object.entries(contentTypeInteractions)
                .map(([type, count]) => ({
                    type: type as 'articles' | 'challenges' | 'quizz',
                    score: total > 0 ? (count / total) * 100 : 33.33,
                    interactionCount: count,
                }))
                .sort((a, b) => b.score - a.score);
        } catch (error) {
            this.logger.error(`Erreur lors de l'analyse des types de contenu: ${error.message}`);
            return [
                { type: 'articles', score: 33.33, interactionCount: 0 },
                { type: 'challenges', score: 33.33, interactionCount: 0 },
                { type: 'quizz', score: 33.33, interactionCount: 0 },
            ];
        }
    }

    private async analyzeDifficultyPreference(
        _userId: number,
        logs: RequestLog[],
    ): Promise<'easy' | 'medium' | 'hard'> {
        try {
            const quizzCompletionLogs = logs.filter(
                (log) =>
                    log.url && log.url.includes('/quizz/') && log.method === 'PUT' && log.url.includes('/complete'),
            );

            const difficultyInteractions = {
                easy: 0,
                medium: 0,
                hard: 0,
            };

            for (const log of quizzCompletionLogs) {
                try {
                    const quizzId = this.extractIdFromUrl(log.url, '/quizz/');
                    if (quizzId) {
                        const quizz = await this.quizzRepository.findOne({
                            where: { id: quizzId },
                        });

                        if (quizz?.difficulty) {
                            const difficultyKey = quizz.difficulty.toLowerCase();
                            if (difficultyKey in difficultyInteractions) {
                                difficultyInteractions[difficultyKey]++;
                            }
                        }
                    }
                } catch (error) {
                    this.logger.warn(`Erreur lors de l'analyse du quizz: ${error.message}`);
                }
            }

            const maxDifficulty = Object.entries(difficultyInteractions).reduce(
                (max, [difficulty, count]) => (count > max.count ? { difficulty, count } : max),
                { difficulty: 'easy', count: 0 },
            );

            return maxDifficulty.difficulty as 'easy' | 'medium' | 'hard';
        } catch (error) {
            this.logger.error(`Erreur lors de l'analyse de la difficulté: ${error.message}`);
            return 'easy';
        }
    }

    private calculateActivityScore(logs: RequestLog[], daysBack: number): number {
        try {
            if (logs.length === 0) return 0;

            const uniqueDays = new Set(
                logs
                    .map((log) => {
                        try {
                            return log.timestamp.toISOString().split('T')[0];
                        } catch (error) {
                            this.logger.warn(`Erreur lors de l'extraction de la date du log: ${error.message}`);
                            return null;
                        }
                    })
                    .filter((date) => date !== null),
            ).size;

            const avgDailyActivity = logs.length / daysBack;
            const consistencyScore = (uniqueDays / daysBack) * 100;

            return Math.min(100, avgDailyActivity * 10 + consistencyScore * 0.5);
        } catch (error) {
            this.logger.error(`Erreur lors du calcul du score d'activité: ${error.message}`);
            return 0;
        }
    }

    private extractIdFromUrl(url: string, pattern: string): number | null {
        try {
            const regex = new RegExp(`${pattern.replace('/', '\\/')}(\\d+)`);
            const match = url.match(regex);
            return match ? parseInt(match[1], 10) : null;
        } catch (error) {
            this.logger.warn(`Erreur lors de l'extraction de l'ID depuis l'URL: ${error.message}`);
            return null;
        }
    }
}
