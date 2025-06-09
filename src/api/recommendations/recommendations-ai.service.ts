import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BehaviorAnomalyType,
    ChurnPredictionType,
    GetOptimalRecommendationTimingType,
    SimilarUserType,
    TimePatternType,
    UserBehaviorPattern,
} from '@src/types/recommendationsTypes';
import { Not, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { RequestLog } from '../request-logs/entities/request-log.entity';
import { User } from '../users/entities/user.entity';
import { UserPreferencesService } from '../users/user-preferences.service';

@Injectable()
export class AIRecommendationsService {
    private readonly logger: Logger;

    constructor(
        @InjectRepository(RequestLog)
        private readonly requestLogRepository: Repository<RequestLog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
        @InjectRepository(Quizz)
        private readonly quizzRepository: Repository<Quizz>,
        private readonly userPreferencesService: UserPreferencesService,
    ) {
        this.logger = new Logger(AIRecommendationsService.name);
    }

    async analyzeBehaviorPatterns(userId: number): Promise<UserBehaviorPattern> {
        const logs = await this.requestLogRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: 1000,
        });

        return {
            userId,
            timePatterns: this.analyzeTimePatterns(logs),
            sessionDuration: this.calculateAverageSessionDuration(logs),
            contentConsumptionRate: this.calculateConsumptionRate(logs),
            interactionQuality: this.calculateInteractionQuality(logs),
        };
    }

    async findSimilarUsers(userId: number, limit: number = 5): Promise<SimilarUserType[]> {
        const userPrefs = await this.userPreferencesService.analyzeUserPreferences(userId);
        const allUsers = await this.userRepository.find({ take: 10 }); // Limitation pour performance

        const similarities: SimilarUserType[] = [];

        for (const user of allUsers) {
            if (user.id === userId) continue;

            const otherPrefs = await this.userPreferencesService.analyzeUserPreferences(user.id);
            const similarityScore = this.calculateSimilarityScore(userPrefs, otherPrefs);

            if (similarityScore > 0.3) {
                const commonInterests = this.findCommonInterests(userPrefs, otherPrefs);
                similarities.push({
                    userId: user.id,
                    similarityScore,
                    commonInterests,
                });
            }
        }

        return similarities.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, limit);
    }

    async getCollaborativeRecommendations(userId: number): Promise<{
        articles: Article[];
        challenges: Challenge[];
        reasoning: string[];
    }> {
        const similarUsers = await this.findSimilarUsers(userId);
        const reasoning: string[] = [];

        if (similarUsers.length === 0) {
            reasoning.push(
                "Pas assez d'utilisateurs similaires trouvés. Utilisation des recommandations basées sur le contenu.",
            );
            return {
                articles: [],
                challenges: [],
                reasoning,
            };
        }

        const similarUserIds = similarUsers.map((u) => u.userId);

        const recommendedArticles = await this.articleRepository
            .createQueryBuilder('article')
            .innerJoin('article.reads', 'reads')
            .where('reads.id IN (:...userIds)', { userIds: similarUserIds })
            .andWhere('article.id NOT IN (SELECT ar.id FROM article ar INNER JOIN ar.reads r WHERE r.id = :userId)', {
                userId,
            })
            .groupBy('article.id')
            .orderBy('COUNT(reads.id)', 'DESC')
            .take(5)
            .getMany();

        const recommendedChallenges = await this.challengeRepository
            .createQueryBuilder('challenge')
            .innerJoin('challenge.userToChallenge', 'utc')
            .where('utc.userId IN (:...userIds)', { userIds: similarUserIds })
            .andWhere(
                'challenge.id NOT IN (SELECT c.id FROM challenge c INNER JOIN c.userToChallenge uc WHERE uc.userId = :userId)',
                { userId },
            )
            .groupBy('challenge.id')
            .orderBy('COUNT(utc.id)', 'DESC')
            .take(5)
            .getMany();

        reasoning.push(`Basé sur ${similarUsers.length} utilisateurs avec des intérêts similaires`);
        reasoning.push(`Intérêts communs: ${similarUsers[0].commonInterests.join(', ')}`);

        return {
            articles: recommendedArticles,
            challenges: recommendedChallenges,
            reasoning,
        };
    }

    async getTimeBasedRecommendations(userId: number): Promise<{
        content: any[];
        bestTime: string;
        reasoning: string[];
    }> {
        try {
            const behaviorPattern = await this.analyzeBehaviorPatterns(userId);
            const userPreferences = await this.userPreferencesService.analyzeUserPreferences(userId);
            const reasoning: string[] = [];

            // Déterminer le meilleur moment
            const bestTimePattern = behaviorPattern.timePatterns.sort((a, b) => b.frequency - a.frequency)[0];

            let bestTime = 'N/A';
            if (bestTimePattern) {
                const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                bestTime = `${days[bestTimePattern.dayOfWeek]} à ${bestTimePattern.hour}h`;
                reasoning.push(`Vous êtes généralement plus actif ${bestTime}`);
            }

            // Analyser la durée des sessions pour adapter le contenu
            const shortContent = behaviorPattern.sessionDuration < 300; // 5 minutes
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentDay = currentTime.getDay();

            if (shortContent) {
                reasoning.push('Sessions courtes détectées - contenu rapide recommandé');
            } else {
                reasoning.push('Sessions longues détectées - contenu approfondi recommandé');
            }

            // Déterminer le type de contenu basé sur l'heure actuelle
            const isWorkingHours = currentHour >= 9 && currentHour <= 17;
            const isWeekend = currentDay === 0 || currentDay === 6;
            const isEvening = currentHour >= 18 && currentHour <= 22;
            const isMorning = currentHour >= 6 && currentHour <= 10;

            const contentFilter = {
                difficulty: userPreferences.difficultyLevel,
                estimatedReadingTime: shortContent ? 5 : 15, // minutes
                categories: userPreferences.favoriteCategories.slice(0, 2).map((c) => c.category),
                contentType: 'mixed' as 'articles' | 'challenges' | 'quizz' | 'mixed',
            };

            // Adapter le contenu selon le moment
            if (isMorning) {
                contentFilter.contentType = 'articles';
                reasoning.push('Matin détecté - articles informatifs recommandés pour bien commencer la journée');
            } else if (isWorkingHours && !isWeekend) {
                contentFilter.contentType = shortContent ? 'quizz' : 'articles';
                contentFilter.estimatedReadingTime = 5; // Contenu court pendant les heures de travail
                reasoning.push('Heures de travail - contenu rapide et éducatif recommandé');
            } else if (isEvening) {
                contentFilter.contentType = 'challenges';
                reasoning.push('Soirée détectée - défis pratiques pour mettre en application vos connaissances');
            } else if (isWeekend) {
                contentFilter.difficulty = this.getNextDifficultyLevel(userPreferences.difficultyLevel);
                reasoning.push('Weekend détecté - moment idéal pour approfondir vos connaissances');
            }

            // Récupérer le contenu adapté
            const content = await this.getAdaptedContent(contentFilter, shortContent ? 5 : 10);

            // Ajouter des recommandations spécifiques selon les patterns temporels
            if (bestTimePattern && this.isOptimalTime(bestTimePattern, currentHour, currentDay)) {
                reasoning.push("✨ C'est votre moment optimal ! Profitez-en pour explorer du contenu plus avancé.");

                // Ajouter du contenu premium/avancé si c'est le moment optimal
                const premiumContent = await this.getPremiumContent(userPreferences, 3);
                content.push(...premiumContent);
            }

            // Recommandations basées sur l'historique temporel
            const timeBasedSuggestions = await this.getTimeBasedSuggestions(userId, currentHour, currentDay);
            content.push(...timeBasedSuggestions);

            return {
                content: this.shuffleAndLimitContent(content, shortContent ? 8 : 15),
                bestTime,
                reasoning,
            };
        } catch (error) {
            this.logger.error(
                `Erreur lors de la génération des recommandations temporelles pour l'utilisateur ${userId}:`,
                error,
            );
            return {
                content: [],
                bestTime: 'N/A',
                reasoning: ["Erreur lors de l'analyse temporelle. Recommandations génériques disponibles."],
            };
        }
    }

    async getHybridRecommendations(userId: number): Promise<{
        articles: Article[];
        challenges: Challenge[];
        scores: any;
        explanation: string;
    }> {
        const contentBased = await this.userPreferencesService.getPersonalizedRecommendations(userId, 10);
        const collaborative = await this.getCollaborativeRecommendations(userId);
        // const timeBased = await this.getTimeBasedRecommendations(userId);

        const weights = {
            contentBased: 0.5,
            collaborative: 0.3,
            timeBased: 0.2,
        };

        const explanation = `Recommandations hybrides basées sur:
        - 50% préférences de contenu personnelles
        - 30% comportement d'utilisateurs similaires  
        - 20% patterns temporels d'engagement`;

        return {
            articles: [...contentBased.articles, ...collaborative.articles],
            challenges: [...contentBased.challenges, ...collaborative.challenges],
            scores: weights,
            explanation,
        };
    }

    private analyzeTimePatterns(logs: RequestLog[]): TimePatternType[] {
        const timeMap = new Map<string, number>();

        logs.forEach((log) => {
            const date = new Date(log.timestamp);
            const key = `${date.getDay()}-${date.getHours()}`;
            timeMap.set(key, (timeMap.get(key) || 0) + 1);
        });

        return Array.from(timeMap.entries())
            .map(([key, frequency]) => {
                const [dayOfWeek, hour] = key.split('-').map(Number);
                return { dayOfWeek, hour, frequency };
            })
            .sort((a, b) => b.frequency - a.frequency);
    }

    private calculateAverageSessionDuration(logs: RequestLog[]): number {
        const sessions: RequestLog[][] = [];
        let currentSession: RequestLog[] = [];

        for (let i = 0; i < logs.length; i++) {
            const current = logs[i];
            const next = logs[i + 1];

            currentSession.push(current);

            if (!next || current.timestamp.getTime() - next.timestamp.getTime() > 30 * 60 * 1000) {
                sessions.push([...currentSession]);
                currentSession = [];
            }
        }

        const durations = sessions.map((session) => {
            if (session.length <= 1) return 0;
            const start = session[session.length - 1].timestamp.getTime();
            const end = session[0].timestamp.getTime();
            return (end - start) / 1000; // en secondes
        });

        return durations.reduce((sum, duration) => sum + duration, 0) / durations.length || 0;
    }

    private calculateConsumptionRate(logs: RequestLog[]): number {
        const readingActions = logs.filter(
            (log) => log.method === 'GET' && (log.url.includes('/articles/') || log.url.includes('/quizz/')),
        );

        const completionActions = logs.filter(
            (log) => log.method === 'PUT' && (log.url.includes('/read') || log.url.includes('/complete')),
        );

        return readingActions.length > 0 ? completionActions.length / readingActions.length : 0;
    }

    private calculateInteractionQuality(logs: RequestLog[]): number {
        const qualityActions = logs.filter(
            (log) =>
                log.url.includes('/likes') ||
                log.url.includes('/save') ||
                log.url.includes('/complete') ||
                log.responseTime < 5000,
        );

        return logs.length > 0 ? (qualityActions.length / logs.length) * 100 : 0;
    }

    private calculateSimilarityScore(userA: any, userB: any): number {
        const categoriesA = userA.favoriteCategories.map((c) => c.category);
        const categoriesB = userB.favoriteCategories.map((c) => c.category);

        const intersection = categoriesA.filter((cat) => categoriesB.includes(cat));
        const union = [...new Set([...categoriesA, ...categoriesB])];

        const jaccardSimilarity = intersection.length / union.length;

        const difficultyBonus = userA.difficultyLevel === userB.difficultyLevel ? 0.2 : 0;

        const contentTypeA = userA.contentTypes[0]?.type || '';
        const contentTypeB = userB.contentTypes[0]?.type || '';
        const contentTypeBonus = contentTypeA === contentTypeB ? 0.1 : 0;

        return Math.min(1, jaccardSimilarity + difficultyBonus + contentTypeBonus);
    }

    private findCommonInterests(userA: any, userB: any): string[] {
        const categoriesA = userA.favoriteCategories.map((c) => c.category);
        const categoriesB = userB.favoriteCategories.map((c) => c.category);

        return categoriesA.filter((cat) => categoriesB.includes(cat));
    }

    async detectBehaviorAnomalies(userId: number): Promise<BehaviorAnomalyType> {
        const recentBehavior = await this.analyzeBehaviorPatterns(userId);
        const recentPrefs = await this.userPreferencesService.analyzeUserPreferences(userId, 7);
        const historicalPrefs = await this.userPreferencesService.analyzeUserPreferences(userId, 30);

        const anomalies: string[] = [];
        const suggestions: string[] = [];

        if (recentPrefs.activityScore < historicalPrefs.activityScore * 0.5) {
            anomalies.push("Baisse significative d'activité détectée");
            suggestions.push('Essayez de vous reconnecter avec du contenu dans vos catégories préférées');
        }

        const topHistoricalCategory = historicalPrefs.favoriteCategories[0]?.category;
        const topRecentCategory = recentPrefs.favoriteCategories[0]?.category;

        if (topHistoricalCategory && topRecentCategory && topHistoricalCategory !== topRecentCategory) {
            anomalies.push("Changement de centres d'intérêt détecté");
            suggestions.push(`Exploration de nouveaux sujets : ${topRecentCategory}. Continuez à diversifier !`);
        }

        if (recentBehavior.sessionDuration < 60) {
            anomalies.push('Sessions très courtes détectées');
            suggestions.push('Prenez plus de temps pour explorer le contenu en profondeur');
        }

        if (recentBehavior.interactionQuality < 20) {
            anomalies.push("Faible niveau d'engagement détecté");
            suggestions.push("Essayez d'interagir plus avec le contenu (likes, sauvegardes, commentaires)");
        }

        return { anomalies, suggestions };
    }

    async predictUserChurn(userId: number): Promise<ChurnPredictionType> {
        const behavior = await this.analyzeBehaviorPatterns(userId);
        const preferences = await this.userPreferencesService.analyzeUserPreferences(userId, 14);

        let churnScore = 0;
        const reasons: string[] = [];
        const retentionActions: string[] = [];

        if (preferences.activityScore < 20) {
            churnScore += 30;
            reasons.push('Très faible activité récente');
            retentionActions.push('Envoyer du contenu personnalisé par email');
        }

        if (behavior.sessionDuration < 120) {
            churnScore += 25;
            reasons.push('Sessions très courtes');
            retentionActions.push('Proposer du contenu plus engageant et interactif');
        }

        if (behavior.interactionQuality < 15) {
            churnScore += 20;
            reasons.push('Faible engagement avec le contenu');
            retentionActions.push("Gamifier l'expérience utilisateur");
        }

        if (preferences.favoriteCategories.length === 0) {
            churnScore += 15;
            reasons.push('Aucune préférence claire identifiée');
            retentionActions.push('Proposer un quiz de personnalité pour identifier les intérêts');
        }

        const logs = await this.requestLogRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: 1,
        });

        if (logs.length > 0) {
            const daysSinceLastActivity = (Date.now() - logs[0].timestamp.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastActivity > 7) {
                churnScore += 25;
                reasons.push("Inactif depuis plus d'une semaine");
                retentionActions.push('Campagne de ré-engagement immédiate');
            }
        }

        const churnProbability = Math.min(100, churnScore);
        let riskLevel: 'low' | 'medium' | 'high' = 'low';

        if (churnProbability >= 70) riskLevel = 'high';
        else if (churnProbability >= 40) riskLevel = 'medium';

        return {
            churnProbability,
            riskLevel,
            reasons,
            retentionActions,
        };
    }

    async getOptimalRecommendationTiming(userId: number): Promise<GetOptimalRecommendationTimingType> {
        const behavior = await this.analyzeBehaviorPatterns(userId);
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

        const bestTimes = behavior.timePatterns.slice(0, 3).map((pattern) => ({
            day: days[pattern.dayOfWeek],
            hour: pattern.hour,
            score: pattern.frequency,
        }));

        const now = new Date();
        const nextRecommendationTime = new Date();

        if (bestTimes.length > 0) {
            const bestPattern = bestTimes[0];
            const targetDay = days.indexOf(bestPattern.day);
            const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;

            nextRecommendationTime.setDate(now.getDate() + daysUntilTarget);
            nextRecommendationTime.setHours(bestPattern.hour, 0, 0, 0);

            if (nextRecommendationTime <= now) {
                nextRecommendationTime.setDate(nextRecommendationTime.getDate() + 7);
            }
        }

        const reasoning =
            bestTimes.length > 0
                ? `Basé sur l'analyse de vos patterns d'activité, vous êtes généralement plus actif ${bestTimes[0].day} vers ${bestTimes[0].hour}h`
                : 'Pas assez de données pour déterminer le timing optimal. Recommandations envoyées selon les horaires standards.';

        return {
            bestTimes,
            nextRecommendationTime,
            reasoning,
        };
    }

    private async getAdaptedContent(filter: any, limit: number): Promise<any[]> {
        const content: any[] = [];

        try {
            // Articles adaptés
            if (filter.contentType === 'articles' || filter.contentType === 'mixed') {
                const articlesQuery = this.articleRepository
                    .createQueryBuilder('article')
                    .leftJoinAndSelect('article.category', 'category')
                    .leftJoinAndSelect('article.authors', 'authors');

                if (filter.categories.length > 0) {
                    articlesQuery.where('category.title IN (:...categories)', { categories: filter.categories });
                }

                // Filtrer par temps de lecture estimé (basé sur le nombre de mots)
                if (filter.estimatedReadingTime <= 5) {
                    articlesQuery.andWhere('LENGTH(article.content) <= :shortContent', { shortContent: 1500 });
                } else {
                    articlesQuery.andWhere('LENGTH(article.content) > :longContent', { longContent: 1500 });
                }

                const articles: Article[] = await articlesQuery
                    .leftJoinAndSelect('article.article_content', 'content')
                    .orderBy('article.creation_date', 'DESC')
                    .take(Math.ceil(limit * 0.5))
                    .getMany();

                const estimatedReadingTime = 0;
                let formattedReadingTime = '';

                // Calculer le temps de lecture estimé pour chaque article
                articles.forEach((article) => {
                    estimatedReadingTime + article?.articleContent?.length * 1.5; // 1.5s par section de contenu
                });

                if (estimatedReadingTime > 60) {
                    formattedReadingTime = `${Math.floor(estimatedReadingTime / 60)} minutes`;
                } else {
                    formattedReadingTime = `${estimatedReadingTime} secondes`;
                }

                content.push(
                    ...articles.map((article) => ({
                        ...article,
                        type: 'article',
                        estimatedTime: formattedReadingTime,
                        relevanceScore: this.calculateTemporalRelevance(article, filter),
                    })),
                );
            }

            // Défis adaptés
            if (filter.contentType === 'challenges' || filter.contentType === 'mixed') {
                const challengesQuery = this.challengeRepository
                    .createQueryBuilder('challenge')
                    .leftJoinAndSelect('challenge.enterprise', 'enterprise');

                if (filter.categories.length > 0) {
                    challengesQuery.where('challenge.category IN (:...categories)', { categories: filter.categories });
                }

                const challenges = await challengesQuery
                    .orderBy('challenge.creation_date', 'DESC')
                    .take(Math.ceil(limit * 0.3))
                    .getMany();

                content.push(
                    ...challenges.map((challenge) => ({
                        ...challenge,
                        type: 'challenge',
                        relevanceScore: this.calculateTemporalRelevance(challenge, filter),
                    })),
                );
            }

            if (filter.contentType === 'quizz' || filter.contentType === 'mixed') {
                const quizzQuery = this.quizzRepository
                    .createQueryBuilder('quizz')
                    .leftJoinAndSelect('quizz.challenge', 'challenge');

                if (filter.difficulty) {
                    quizzQuery.where('quizz.difficulty = :difficulty', { difficulty: filter.difficulty });
                }

                const quizzes = await quizzQuery
                    .orderBy('quizz.id', 'DESC')
                    .take(Math.ceil(limit * 0.2))
                    .getMany();

                content.push(
                    ...quizzes.map((quiz) => ({
                        ...quiz,
                        type: 'quizz',
                        relevanceScore: this.calculateTemporalRelevance(quiz, filter),
                    })),
                );
            }
        } catch (error) {
            this.logger.error('Erreur lors de la récupération du contenu adapté:', error);
        }

        return content;
    }

    private async getPremiumContent(preferences: any, limit: number): Promise<any[]> {
        try {
            const premiumContent: any[] = [];

            const topArticles = await this.articleRepository
                .createQueryBuilder('article')
                .leftJoinAndSelect('article.category', 'category')
                .leftJoinAndSelect('article.likes', 'likes')
                .where('category.title IN (:...categories)', {
                    categories: preferences.favoriteCategories.slice(0, 2).map((c) => c.category),
                })
                .orderBy('article.views', 'DESC')
                .addOrderBy('COUNT(likes.id)', 'DESC')
                .groupBy('article.id, category.id')
                .take(limit)
                .getMany();

            premiumContent.push(
                ...topArticles.map((article) => ({
                    ...article,
                    type: 'article',
                    isPremium: true,
                    relevanceScore: 95,
                })),
            );

            return premiumContent;
        } catch (error) {
            this.logger.error('Erreur lors de la récupération du contenu premium:', error);
            return [];
        }
    }

    private async getTimeBasedSuggestions(userId: number, currentHour: number, currentDay: number): Promise<any[]> {
        try {
            const historicalLogs = await this.requestLogRepository
                .createQueryBuilder('log')
                .where('log.userId = :userId', { userId })
                .andWhere('EXTRACT(hour FROM log.timestamp) = :hour', { hour: currentHour })
                .andWhere('EXTRACT(dow FROM log.timestamp) = :day', { day: currentDay })
                .andWhere('log.url LIKE :pattern', { pattern: '%/articles/%' })
                .orderBy('log.timestamp', 'DESC')
                .take(10)
                .getMany();

            const suggestions: any[] = [];

            for (const log of historicalLogs) {
                try {
                    const articleId = this.extractIdFromUrl(log.url, '/articles/');
                    if (articleId) {
                        const similarArticles = await this.findSimilarContent(articleId, 'article', 2);
                        suggestions.push(
                            ...similarArticles.map((article) => ({
                                ...article,
                                type: 'article',
                                reason: 'similar_to_previous',
                                relevanceScore: 75,
                            })),
                        );
                    }
                } catch (_error) {
                    // Ignore
                }
            }

            return suggestions.slice(0, 5); // Limiter à 5 suggestions
        } catch (error) {
            this.logger.error('Erreur lors de la récupération des suggestions temporelles:', error);
            return [];
        }
    }

    private async findSimilarContent(itemId: number, itemType: 'article' | 'challenge', limit: number): Promise<any[]> {
        try {
            if (itemType === 'article') {
                const originalArticle = await this.articleRepository.findOne({
                    where: { id: itemId },
                    relations: ['category'],
                });

                if (originalArticle?.category) {
                    return await this.articleRepository.find({
                        where: {
                            category: { title: originalArticle.category.title },
                            id: Not(itemId), // Exclure l'article original
                        },
                        relations: ['category'],
                        take: limit,
                        order: { creation_date: 'DESC' },
                    });
                }
            }

            return [];
        } catch (error) {
            this.logger.error('Erreur lors de la recherche de contenu similaire:', error);
            return [];
        }
    }
    private getNextDifficultyLevel(currentLevel: 'easy' | 'medium' | 'hard'): 'easy' | 'medium' | 'hard' {
        const levels = { easy: 'medium', medium: 'hard', hard: 'hard' };
        return levels[currentLevel] as 'easy' | 'medium' | 'hard';
    }

    private isOptimalTime(bestPattern: any, currentHour: number, currentDay: number): boolean {
        return bestPattern.hour === currentHour && bestPattern.dayOfWeek === currentDay;
    }

    private calculateTemporalRelevance(item: any, filter: any): number {
        let score = 50;
        if (filter.categories.includes(item.category?.title || item.category)) {
            score += 30;
        }

        const daysSinceCreation = (Date.now() - new Date(item.creation_date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation <= 7) score += 20;
        else if (daysSinceCreation <= 30) score += 10;

        const popularity = (item.views || 0) + (item.likes?.length || 0);
        if (popularity > 100) score += 15;
        else if (popularity > 50) score += 10;

        return Math.min(100, score);
    }

    private shuffleAndLimitContent(content: any[], limit: number): any[] {
        const sorted = content.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        const top = sorted.slice(0, Math.min(limit, sorted.length));

        for (let i = top.length - 1; i > 0; i--) {
            if (Math.random() < 0.3) {
                const j = Math.floor(Math.random() * (i + 1));
                [top[i], top[j]] = [top[j], top[i]];
            }
        }

        return top;
    }

    private extractIdFromUrl(url: string, pattern: string): number | null {
        try {
            const regex = new RegExp(`${pattern.replace('/', '\\/')}(\\d+)`);
            const match = url.match(regex);
            return match ? parseInt(match[1], 10) : null;
        } catch (error) {
            return null;
        }
    }
}
