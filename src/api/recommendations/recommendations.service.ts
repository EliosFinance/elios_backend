import { Injectable } from '@nestjs/common';
import { UserPreferencesType } from '@src/types/recommendationsTypes';
import { UserPreferencesService } from '../users/user-preferences.service';

@Injectable()
export class RecommendationsService {
    constructor(private readonly userPreferencesService: UserPreferencesService) {}

    generateUserSummary(preferences: UserPreferencesType): string {
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
    }

    generateRecommendationText(preferences: UserPreferencesType): string[] {
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
    }

    async generateTrends(userId: number): Promise<string[]> {
        const currentPrefs = await this.userPreferencesService.analyzeUserPreferences(userId, 30);
        const pastPrefs = await this.userPreferencesService.analyzeUserPreferences(userId, 60);

        const trends = [];

        if (!pastPrefs || !currentPrefs) {
            return [
                "Nous n'avons pas assez de données pour analyser les tendances. Continuez à interagir avec le contenu.",
            ];
        }

        if (currentPrefs.activityScore > pastPrefs.activityScore + 10) {
            trends.push('📈 Votre activité a augmenté ce mois-ci !');
        } else if (currentPrefs.activityScore < pastPrefs.activityScore - 10) {
            trends.push('📉 Votre activité a diminué. Essayez de vous reconnecter avec le contenu.');
        }

        const newCategories = currentPrefs.favoriteCategories.filter(
            (curr) => !pastPrefs.favoriteCategories.some((past) => past.category === curr.category),
        );

        if (newCategories.length > 0) {
            trends.push(`🔍 Vous explorez de nouveaux sujets: ${newCategories.map((c) => c.category).join(', ')}`);
        }

        return trends;
    }
}
