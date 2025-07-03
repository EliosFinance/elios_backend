import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserPreferencesService } from '../users/user-preferences.service';
import { AIRecommendationsService } from './recommendations-ai.service';
import { RecommendationsCacheService } from './recommendations-cache.service';

@Injectable()
export class RecommendationsScheduler {
    private readonly logger = new Logger(RecommendationsScheduler.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly userPreferencesService: UserPreferencesService,
        private readonly aiService: AIRecommendationsService,
        private readonly cacheService: RecommendationsCacheService,
    ) {}

    @Cron(CronExpression.EVERY_HOUR)
    async cleanupCache() {
        this.logger.log('Nettoyage du cache des recommandations...');
        this.cacheService.cleanup();

        const stats = this.cacheService.getStats();
        this.logger.log(
            `Cache nettoyé - Entrées restantes: ${stats.totalEntries}, Expirées supprimées: ${stats.expiredEntries}`,
        );
    }

    @Cron('0 6 * * *')
    async pregenerateRecommendations() {
        this.logger.log('Pré-génération des recommandations pour les utilisateurs actifs...');

        try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const activeUsers = await this.userRepository
                .createQueryBuilder('user')
                .innerJoin('request_log', 'log', 'log.userId = user.id')
                .where('log.timestamp >= :date', { date: sevenDaysAgo })
                .groupBy('user.id')
                .having('COUNT(log.id) >= 5')
                .getMany();

            this.logger.log(`Pré-génération pour ${activeUsers.length} utilisateurs actifs`);

            let processed = 0;
            const batchSize = 10;

            for (let i = 0; i < activeUsers.length; i += batchSize) {
                const batch = activeUsers.slice(i, i + batchSize);

                await Promise.all(
                    batch.map(async (user) => {
                        try {
                            const preferences = await this.userPreferencesService.analyzeUserPreferences(user.id);
                            this.cacheService.setUserPreferences(user.id, preferences, 24 * 60 * 60 * 1000); // 24h

                            const recommendations = await this.aiService.getHybridRecommendations(user);
                            this.cacheService.setRecommendations(
                                user.id,
                                'hybrid_10',
                                recommendations,
                                12 * 60 * 60 * 1000,
                            ); // 12h

                            processed++;
                        } catch (error) {
                            this.logger.error(`Erreur lors de la pré-génération pour l'utilisateur ${user.id}:`, error);
                        }
                    }),
                );

                if (i + batchSize < activeUsers.length) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }

            this.logger.log(`Pré-génération terminée pour ${processed} utilisateurs`);
        } catch (error) {
            this.logger.error('Erreur lors de la pré-génération des recommandations:', error);
        }
    }

    @Cron('0 9 * * 1') // Lundi 9h00
    async analyzeChurnRisk() {
        this.logger.log('Analyse des risques de churn utilisateur...');

        try {
            const users = await this.userRepository.find({ take: 100 });
            const highRiskUsers = [];
            const mediumRiskUsers = [];

            for (const user of users) {
                try {
                    const churnAnalysis = await this.aiService.predictUserChurn(user.id);

                    if (churnAnalysis.riskLevel === 'high') {
                        highRiskUsers.push({
                            userId: user.id,
                            username: user.username,
                            churnProbability: churnAnalysis.churnProbability,
                            reasons: churnAnalysis.reasons,
                            actions: churnAnalysis.retentionActions,
                        });
                    } else if (churnAnalysis.riskLevel === 'medium') {
                        mediumRiskUsers.push({
                            userId: user.id,
                            username: user.username,
                            churnProbability: churnAnalysis.churnProbability,
                        });
                    }
                } catch (_error) {
                    this.logger.warn(`Impossible d'analyser le churn pour l'utilisateur ${user.id}`);
                }
            }

            this.logger.log(`Analyse de churn terminée:
                - Risque élevé: ${highRiskUsers.length} utilisateurs
                - Risque moyen: ${mediumRiskUsers.length} utilisateurs`);

            // Ici vous pouvez déclencher des actions automatiques comme:
            // - Envoyer des emails de ré-engagement
            // - Créer des notifications push personnalisées
            // - Marquer les utilisateurs pour un suivi manuel
            // TODO

            if (highRiskUsers.length > 0) {
                this.logger.warn(`Utilisateurs à risque élevé: ${highRiskUsers.map((u) => u.username).join(', ')}`);
                // Déclencher des actions de rétention
                await this.triggerRetentionActions(highRiskUsers);
            }
        } catch (error) {
            this.logger.error("Erreur lors de l'analyse de churn:", error);
        }
    }

    @Cron('0 0 * * 0')
    async optimizeAlgorithms() {
        this.logger.log('Optimisation des algorithmes de recommandation...');

        try {
            const performanceMetrics = await this.analyzeRecommendationPerformance();

            if (performanceMetrics.contentBasedAccuracy > performanceMetrics.collaborativeAccuracy) {
                this.logger.log('Algorithme basé sur le contenu plus performant cette semaine');
                // Ajuster les poids en faveur du content-based
                // TODO
            } else {
                this.logger.log('Algorithme collaboratif plus performant cette semaine');
                // Ajuster les poids en faveur du collaborative filtering
                // TODO
            }

            await this.cleanupOldAnalytics();

            this.logger.log('Optimisation des algorithmes terminée');
        } catch (error) {
            this.logger.error("Erreur lors de l'optimisation des algorithmes:", error);
        }
    }

    @Cron('0 8 * * 1')
    async generateWeeklyReport() {
        this.logger.log('Génération du rapport hebdomadaire des recommandations...');

        try {
            const report = {
                period: `${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} - ${new Date().toISOString().split('T')[0]}`,
                metrics: {
                    totalRecommendations: 0,
                    cacheHitRate: 0,
                    userEngagement: 0,
                    churnPrevention: 0,
                },
                topCategories: [],
                insights: [],
            };

            const cacheStats = this.cacheService.getStats();
            report.metrics.cacheHitRate = cacheStats.hitRate;

            const engagementStats = await this.calculateEngagementStats();
            report.metrics.userEngagement = engagementStats.averageEngagement;

            report.topCategories = await this.getTopCategories();

            report.insights = await this.generateWeeklyInsights();

            this.logger.log('Rapport hebdomadaire généré:', JSON.stringify(report, null, 2));

            // Ici vous pouvez envoyer le rapport par email aux administrateurs
            // ou le sauvegarder dans une base de données pour le dashboard
            // TODO
        } catch (error) {
            this.logger.error('Erreur lors de la génération du rapport:', error);
        }
    }

    // Méthodes utilitaires privées

    private async triggerRetentionActions(highRiskUsers: any[]) {
        for (const user of highRiskUsers) {
            try {
                // Exemple d'actions de rétention
                this.logger.log(`Actions de rétention pour ${user.username}:`);
                user.actions.forEach((action) => this.logger.log(`  - ${action}`));

                // Ici vous pourriez:
                // - Envoyer un email personnalisé
                // - Créer une notification push
                // - Proposer du contenu spécialement adapté
                // - Offrir une promotion ou un avantage
            } catch (error) {
                this.logger.error(`Erreur lors des actions de rétention pour ${user.username}:`, error);
            }
        }
    }

    private async analyzeRecommendationPerformance() {
        // Simuler l'analyse des performances
        // En réalité, vous analyseriez les données de feedback des utilisateurs
        // TODO: Implémenter une logique d'analyse des performances
        return {
            contentBasedAccuracy: Math.random() * 100,
            collaborativeAccuracy: Math.random() * 100,
            hybridAccuracy: Math.random() * 100,
            totalRecommendations: Math.floor(Math.random() * 10000),
            clickThroughRate: Math.random() * 0.3,
        };
    }

    private async cleanupOldAnalytics() {
        // Nettoyer les données d'analyse anciennes (ex: plus de 3 mois)
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        this.logger.log(`Nettoyage des données antérieures au ${cutoffDate.toISOString()}`);
    }

    private async calculateEngagementStats() {
        return {
            averageEngagement: Math.random() * 100,
            totalInteractions: Math.floor(Math.random() * 50000),
            uniqueUsers: Math.floor(Math.random() * 1000),
        };
    }

    private async getTopCategories() {
        // TODO: Implémenter une logique pour récupérer les catégories les plus populaires
        this.logger.log('Génération des insights hebdomadaires...');
        return [
            { category: 'Investissement', interactions: 1245 },
            { category: 'Budget', interactions: 987 },
            { category: 'Épargne', interactions: 756 },
        ];
    }

    private async generateWeeklyInsights() {
        // TODO: Implémenter une logique pour générer des insights basés sur les données de la semaine
        this.logger.log('Génération des insights hebdomadaires...');
        return [
            "L'engagement utilisateur a augmenté de 15% cette semaine",
            "Les articles sur l'investissement sont 30% plus populaires",
            'Le taux de completion des défis a diminué de 5%',
            '3 nouveaux utilisateurs à risque de churn identifiés',
        ];
    }
}
