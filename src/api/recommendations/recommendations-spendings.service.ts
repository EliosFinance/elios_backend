import { Injectable, Logger } from '@nestjs/common';
import { UserSpendingsPreferencesType } from '@src/types/recommendationsTypes';

@Injectable()
export class RecommendationsSpendingsService {
    private readonly logger = new Logger(RecommendationsSpendingsService.name);

    generateUserSummary(preferences: UserSpendingsPreferencesType): string[] {
        const { financialProfile, spendingPatterns, recommendations } = preferences;

        const summary: string[] = [];

        // Titre principal
        summary.push('📊 **Analyse de votre profil financier**');

        // Analyse du taux d'épargne
        let savingsAnalysis = '';
        if (financialProfile.savingsRate < 0) {
            savingsAnalysis = '⚠️ **Situation critique** : Vos dépenses dépassent vos revenus.';
        } else if (financialProfile.savingsRate < 5) {
            savingsAnalysis = "⚡ **Attention** : Votre taux d'épargne est très faible.";
        } else if (financialProfile.savingsRate < 10) {
            savingsAnalysis = "💡 **À améliorer** : Votre taux d'épargne peut être optimisé.";
        } else if (financialProfile.savingsRate < 20) {
            savingsAnalysis = '✅ **Bien** : Vous avez un bon équilibre financier.';
        } else {
            savingsAnalysis = '🎉 **Excellent** : Vous gérez très bien vos finances !';
        }

        summary.push(
            `${savingsAnalysis} Votre taux d'épargne actuel est de ${financialProfile.savingsRate.toFixed(1)}%.`,
        );

        // Analyse des catégories de dépenses
        if (financialProfile.topCategories.length > 0) {
            summary.push('**Vos principales dépenses** :');
            financialProfile.topCategories.slice(0, 3).forEach((category, index) => {
                const emoji = this.getCategoryEmoji(category.category);
                summary.push(
                    `${index + 1}. ${emoji} ${category.category} : ${category.amount.toFixed(0)}€ (${category.percentage.toFixed(1)}%)`,
                );
            });
        }

        // Patterns de dépenses
        summary.push('**Vos habitudes de consommation** :');
        summary.push(`• Montant moyen par transaction : ${spendingPatterns.averageTransactionAmount.toFixed(0)}€`);
        summary.push(`• Nombre de transactions : ${spendingPatterns.transactionFrequency}`);
        summary.push(`• Jour de plus forte dépense : ${spendingPatterns.highestSpendingDay}`);

        // Zones de risque
        if (recommendations.riskAreas.length > 0) {
            summary.push("**Points d'attention** :");
            recommendations.riskAreas.forEach((risk) => {
                const severityEmoji = risk.severity === 'high' ? '🔴' : risk.severity === 'medium' ? '🟡' : '🟢';
                summary.push(`${severityEmoji} ${risk.description}`);
            });
        }

        return summary;
    }

    generateRecommendationText(preferences: UserSpendingsPreferencesType): string[] {
        const { recommendations } = preferences;

        const recommendationText: string[] = [];

        // Titre principal
        recommendationText.push('**Vos recommandations personnalisées**');

        // Recommandations d'optimisation du budget
        if (recommendations.budgetOptimization.length > 0) {
            recommendationText.push('**Optimisations de budget** :');
            recommendations.budgetOptimization
                .sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0))
                .slice(0, 3)
                .forEach((rec, index) => {
                    const priorityEmoji = rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⭐' : '💡';
                    recommendationText.push(`${index + 1}. ${priorityEmoji} ${rec.description}`);
                    recommendationText.push(`   Économies potentielles : ${rec.potentialSavings.toFixed(0)}€`);
                });
        }

        // Opportunités d'épargne
        if (recommendations.savingsOpportunities.length > 0) {
            recommendationText.push("**Opportunités d'épargne** :");
            recommendations.savingsOpportunities.slice(0, 3).forEach((opp, index) => {
                const difficultyEmoji = opp.difficulty === 'easy' ? '🟢' : opp.difficulty === 'medium' ? '🟡' : '🔴';
                recommendationText.push(`${index + 1}. ${difficultyEmoji} **${opp.type}**`);
                recommendationText.push(`   ${opp.description}`);
                recommendationText.push(`   Économies : ${opp.potentialSavings.toFixed(0)}€`);
                recommendationText.push(`   Délai : ${opp.timeframe}`);
            });
        }

        // Plan d'action
        recommendationText.push("**Plan d'action recommandé** :");

        if (preferences.financialProfile.savingsRate < 0) {
            recommendationText.push(
                '1. **URGENT** : Établissez un budget strict et réduisez les dépenses non essentielles',
            );
            recommendationText.push('2. Identifiez 3 postes de dépense à réduire immédiatement');
            recommendationText.push('3. Suivez quotidiennement vos dépenses pendant 2 semaines');
        } else if (preferences.financialProfile.savingsRate < 10) {
            recommendationText.push("1. Fixez-vous un objectif d'épargne de 10% minimum");
            recommendationText.push('2. Automatisez un virement vers votre compte épargne');
            recommendationText.push('3. Utilisez une app de budget pour suivre vos dépenses');
        } else {
            recommendationText.push('1. Continuez sur cette lancée, vous gérez bien vos finances !');
            recommendationText.push('2. Explorez des placements pour faire fructifier votre épargne');
            recommendationText.push('3. Définissez des objectifs financiers à long terme');
        }

        return recommendationText;
    }

    generateMotivationalMessage(preferences: UserSpendingsPreferencesType): string {
        const savingsRate = preferences.financialProfile.savingsRate;

        if (savingsRate < 0) {
            return '💪 Ne vous découragez pas ! Chaque petit changement compte. Commencez par identifier une dépense non essentielle à réduire cette semaine.';
        } else if (savingsRate < 5) {
            return "🌱 Vous êtes sur la bonne voie ! Essayez d'augmenter votre épargne petit à petit. Même 20€ de plus par mois font la différence sur le long terme.";
        } else if (savingsRate < 15) {
            return "👏 Bravo ! Vous avez de bonnes habitudes financières. Continuez ainsi et explorez de nouvelles façons d'optimiser votre budget.";
        } else {
            return "🏆 Félicitations ! Vous êtes un expert en gestion financière. Votre discipline vous permettra d'atteindre vos objectifs rapidement !";
        }
    }

    private getCategoryEmoji(category: string): string {
        const emojiMap: { [key: string]: string } = {
            Alimentation: '🍕',
            Transport: '🚗',
            Logement: '🏠',
            Loisirs: '🎬',
            Vêtements: '👕',
            Santé: '⚕️',
            Éducation: '📚',
            Factures: '📄',
            Restaurant: '🍽️',
            Shopping: '🛍️',
            Essence: '⛽',
            Épargne: '💰',
            Investissement: '📈',
            default: '💳',
        };

        return emojiMap[category] || emojiMap['default'];
    }

    calculateFinancialScore(preferences: UserSpendingsPreferencesType): number {
        let score = 50;

        // Score basé sur le taux d'épargne (40 points max)
        const savingsRate = preferences.financialProfile.savingsRate;
        if (savingsRate >= 20) score += 40;
        else if (savingsRate >= 15) score += 35;
        else if (savingsRate >= 10) score += 25;
        else if (savingsRate >= 5) score += 15;
        else if (savingsRate >= 0) score += 5;
        else score -= 20; // Pénalité pour déficit

        // Score basé sur la diversification des dépenses (20 points max)
        const categoryCount = preferences.financialProfile.topCategories.length;
        if (categoryCount >= 5) score += 20;
        else if (categoryCount >= 3) score += 15;
        else if (categoryCount >= 2) score += 10;
        else score += 5;

        // Pénalités pour les zones de risque (jusqu'à -30 points)
        const highRiskCount = preferences.recommendations.riskAreas.filter((r) => r.severity === 'high').length;
        const mediumRiskCount = preferences.recommendations.riskAreas.filter((r) => r.severity === 'medium').length;

        score -= highRiskCount * 15 + mediumRiskCount * 8;

        // Bonus pour les bonnes habitudes (10 points max)
        if (preferences.spendingPatterns.recurringExpenses.length > 0) score += 5; // Dépenses prévisibles
        if (preferences.financialProfile.monthlyTrend.length >= 2) {
            const lastTwoMonths = preferences.financialProfile.monthlyTrend.slice(-2);
            if (lastTwoMonths.length === 2 && lastTwoMonths[1].savings > lastTwoMonths[0].savings) {
                score += 5; // Amélioration des économies
            }
        }

        return Math.max(0, Math.min(100, score));
    }

    generateAdvancedInsights(preferences: UserSpendingsPreferencesType): string[] {
        const insights: string[] = [];

        // Titre principal
        insights.push('**Analyses avancées**');

        // Analyse de la volatilité des dépenses
        const monthlyTrend = preferences.financialProfile.monthlyTrend;
        if (monthlyTrend.length >= 2) {
            const expenseVariation = this.calculateVariation(monthlyTrend.map((m) => m.expenses));
            if (expenseVariation > 30) {
                insights.push(
                    "**Volatilité élevée** : Vos dépenses varient beaucoup d'un mois à l'autre. Essayez de lisser votre budget.",
                );
            } else if (expenseVariation < 10) {
                insights.push('**Dépenses stables** : Excellente régularité dans vos dépenses !');
            }
        }

        // Analyse des dépenses récurrentes
        const recurringTotal = preferences.spendingPatterns.recurringExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0,
        );
        const recurringPercentage = (recurringTotal / preferences.financialProfile.totalExpenses) * 100;

        if (recurringPercentage > 70) {
            insights.push(
                `**Budget prévisible** : ${recurringPercentage.toFixed(1)}% de vos dépenses sont récurrentes. C'est excellent pour la planification !`,
            );
        } else if (recurringPercentage < 30) {
            insights.push(
                '**Dépenses impulsives** : Beaucoup de vos achats semblent spontanés. Essayez de planifier davantage.',
            );
        }

        // Projection d'épargne annuelle
        const monthlySavings = preferences.financialProfile.totalIncome - preferences.financialProfile.totalExpenses;
        const annualSavingsProjection = monthlySavings * 12;
        insights.push(
            `**Projection annuelle** : À ce rythme, vous épargnerez ${annualSavingsProjection.toFixed(0)}€ cette année.`,
        );

        return insights;
    }

    private calculateVariation(values: number[]): number {
        if (values.length < 2) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);

        return (standardDeviation / mean) * 100;
    }
}
