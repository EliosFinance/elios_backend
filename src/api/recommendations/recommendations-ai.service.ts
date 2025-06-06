import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BehaviorAnomalyType,
    ChurnPredictionType,
    GetOptimalRecommendationTimingType,
    SimilarUserType,
    TimePatternType,
    UserBehaviorPattern,
} from '@src/types/recommendationsTypes';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { RequestLog } from '../request-logs/entities/request-log.entity';
import { User } from '../users/entities/user.entity';
import { UserPreferencesService } from '../users/user-preferences.service';

@Injectable()
export class AIRecommendationsService {
    constructor(
        @InjectRepository(RequestLog)
        private readonly requestLogRepository: Repository<RequestLog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
        private readonly userPreferencesService: UserPreferencesService,
    ) {}

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
        const allUsers = await this.userRepository.find({ take: 100 }); // Limitation pour performance

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
        const behaviorPattern = await this.analyzeBehaviorPatterns(userId);
        const reasoning: string[] = [];

        const bestTimePattern = behaviorPattern.timePatterns.sort((a, b) => b.frequency - a.frequency)[0];

        let bestTime = 'N/A';
        if (bestTimePattern) {
            const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            bestTime = `${days[bestTimePattern.dayOfWeek]} à ${bestTimePattern.hour}h`;
            reasoning.push(`Vous êtes généralement plus actif ${bestTime}`);
        }

        const shortContent = behaviorPattern.sessionDuration < 300;

        if (shortContent) {
            reasoning.push('Sessions courtes détectées - contenu rapide recommandé');
        } else {
            reasoning.push('Sessions longues détectées - contenu approfondi recommandé');
        }

        return {
            content: [], //TODO: Ajouter la logique pour récupérer le contenu basé sur les préférences temporelles
            bestTime,
            reasoning,
        };
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
}
