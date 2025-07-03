import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BudgetRecommendation,
    CategorySpending,
    MonthlySpending,
    PersonalizedRecommendations,
    RecurringExpense,
    RiskArea,
    SavingsOpportunity,
    UserSpendingsPreferencesType,
} from '@src/types/recommendationsTypes';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';
import { Challenge } from '../challenges/entities/challenge.entity';
import { PowensService } from '../powens/powens.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserSpendingsService {
    private readonly logger = new Logger(UserSpendingsService.name);

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
        private powensService: PowensService,
    ) {}

    async analyzeUserPreferences(user: User, daysBack: number = 30): Promise<UserSpendingsPreferencesType> {
        try {
            const { id: userId } = user;
            this.logger.log(`Analyzing preferences for user ${userId} over ${daysBack} days`);

            const userConnections = await this.powensService.getUserConnections(user);
            if (!userConnections || userConnections.length === 0) {
                throw new NotFoundException(
                    `User ${user.username} hasn't connected any bank account. Thus, no transactions to analyze.`,
                );
            }

            const transactions = await this.getRecentTransactions(userId, daysBack);

            if (transactions.length === 0) {
                return this.getDefaultPreferences();
            }

            const financialProfile = this.analyzeFinancialProfile(transactions);
            const spendingPatterns = this.analyzeSpendingPatterns(transactions);
            const recommendations = this.generateRecommendations(financialProfile, spendingPatterns);

            return {
                financialProfile,
                spendingPatterns,
                recommendations,
            };
        } catch (error) {
            this.logger.error(`Error analyzing preferences for user ${user.id}: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async getRecentTransactions(userId: number, daysBack: number): Promise<Transaction[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);

        return this.transactionRepository.find({
            where: {
                user: { id: userId },
                date: MoreThanOrEqual(cutoffDate.toISOString()),
            },
            order: { date: 'DESC' },
        });
    }

    private analyzeFinancialProfile(transactions: Transaction[]): UserSpendingsPreferencesType['financialProfile'] {
        const income = transactions.filter((t) => t.value > 0).reduce((sum, t) => sum + Number(t.value), 0);

        const expenses = Math.abs(transactions.filter((t) => t.value < 0).reduce((sum, t) => sum + Number(t.value), 0));

        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        const categoryMap = new Map<string, { amount: number; count: number }>();
        transactions
            .filter((t) => t.value < 0)
            .forEach((transaction) => {
                const categories = transaction.categories || ['Autre'];
                categories.forEach((category) => {
                    const current = categoryMap.get(category) || { amount: 0, count: 0 };
                    categoryMap.set(category, {
                        amount: current.amount + Math.abs(Number(transaction.value)),
                        count: current.count + 1,
                    });
                });
            });

        const topCategories: CategorySpending[] = Array.from(categoryMap.entries())
            .map(([category, data]) => ({
                category,
                amount: data.amount,
                percentage: (data.amount / expenses) * 100,
                transactionCount: data.count,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        const monthlyTrend: MonthlySpending[] = this.calculateMonthlyTrends(transactions);

        return {
            totalIncome: income,
            totalExpenses: expenses,
            savingsRate,
            topCategories,
            monthlyTrend,
        };
    }

    private analyzeSpendingPatterns(transactions: Transaction[]): UserSpendingsPreferencesType['spendingPatterns'] {
        const expenseTransactions = transactions.filter((t) => t.value < 0);

        const averageTransactionAmount =
            expenseTransactions.length > 0
                ? Math.abs(expenseTransactions.reduce((sum, t) => sum + Number(t.value), 0)) /
                  expenseTransactions.length
                : 0;

        const transactionFrequency = expenseTransactions.length;

        const daySpending = new Map<string, number>();
        expenseTransactions.forEach((transaction) => {
            const day = new Date(transaction.date).toLocaleDateString('fr-FR', { weekday: 'long' });
            const current = daySpending.get(day) || 0;
            daySpending.set(day, current + Math.abs(Number(transaction.value)));
        });

        const highestSpendingDay = Array.from(daySpending.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Lundi';

        const recurringExpenses = this.identifyRecurringExpenses(transactions);

        return {
            averageTransactionAmount,
            transactionFrequency,
            highestSpendingDay,
            recurringExpenses,
        };
    }

    private generateRecommendations(
        financialProfile: UserSpendingsPreferencesType['financialProfile'],
        spendingPatterns: UserSpendingsPreferencesType['spendingPatterns'],
    ): UserSpendingsPreferencesType['recommendations'] {
        const budgetOptimization: BudgetRecommendation[] = [];
        const savingsOpportunities: SavingsOpportunity[] = [];
        const riskAreas: RiskArea[] = [];

        financialProfile.topCategories.forEach((category) => {
            if (category.percentage > 30) {
                budgetOptimization.push({
                    category: category.category,
                    currentSpending: category.amount,
                    recommendedBudget: category.amount * 0.8,
                    potentialSavings: category.amount * 0.2,
                    priority: 'high',
                    description: `Votre budget ${category.category} représente ${category.percentage.toFixed(1)}% de vos dépenses. Essayez de le réduire de 20%.`,
                });
            }
        });

        if (financialProfile.savingsRate < 10) {
            savingsOpportunities.push({
                type: 'Épargne automatique',
                description: 'Mettre en place un virement automatique de 10% de vos revenus vers un compte épargne',
                potentialSavings: financialProfile.totalIncome * 0.1,
                difficulty: 'easy',
                timeframe: '1 mois',
            });
        }

        if (spendingPatterns.averageTransactionAmount > 50) {
            savingsOpportunities.push({
                type: 'Réduction des petites dépenses',
                description: 'Réduire vos dépenses moyennes en planifiant mieux vos achats',
                potentialSavings:
                    spendingPatterns.averageTransactionAmount * 0.15 * spendingPatterns.transactionFrequency,
                difficulty: 'medium',
                timeframe: '2-3 mois',
            });
        }

        if (financialProfile.savingsRate < 0) {
            riskAreas.push({
                type: 'Budget déficitaire',
                description: 'Vos dépenses dépassent vos revenus',
                severity: 'high',
                suggestion: 'Révisez immédiatement votre budget et identifiez les dépenses non essentielles à réduire',
            });
        }

        if (financialProfile.savingsRate < 5) {
            riskAreas.push({
                type: 'Épargne insuffisante',
                description: "Votre taux d'épargne est très faible",
                severity: 'medium',
                suggestion: "Essayez d'économiser au moins 10% de vos revenus chaque mois",
            });
        }

        return {
            budgetOptimization,
            savingsOpportunities,
            riskAreas,
        };
    }

    private calculateMonthlyTrends(transactions: Transaction[]): MonthlySpending[] {
        const monthlyData = new Map<string, { income: number; expenses: number }>();

        transactions.forEach((transaction) => {
            const month = new Date(transaction.date).toISOString().substring(0, 7); // YYYY-MM
            const current = monthlyData.get(month) || { income: 0, expenses: 0 };

            if (Number(transaction.value) > 0) {
                current.income += Number(transaction.value);
            } else {
                current.expenses += Math.abs(Number(transaction.value));
            }

            monthlyData.set(month, current);
        });

        return Array.from(monthlyData.entries())
            .map(([month, data]) => ({
                month,
                income: data.income,
                expenses: data.expenses,
                savings: data.income - data.expenses,
            }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    private identifyRecurringExpenses(transactions: Transaction[]): RecurringExpense[] {
        const recurringMap = new Map<string, Transaction[]>();

        transactions
            .filter((t) => t.value < 0)
            .forEach((transaction) => {
                const key = transaction.simplified_wording.toLowerCase();
                const existing = recurringMap.get(key) || [];
                existing.push(transaction);
                recurringMap.set(key, existing);
            });

        console.log(transactions[0]);

        return Array.from(recurringMap.entries())
            .filter(([_, transactions]) => transactions.length >= 2)
            .map(([description, transactions]) => {
                const avgAmount =
                    transactions.reduce((sum, t) => sum + Math.abs(Number(t.value)), 0) / transactions.length;
                return {
                    description,
                    amount: avgAmount,
                    frequency: 'monthly' as const,
                    category: 'Autre', // TODO: À affiner selon les catégories
                };
            })
            .slice(0, 5);
    }

    private getDefaultPreferences(): UserSpendingsPreferencesType {
        return {
            financialProfile: {
                totalIncome: 0,
                totalExpenses: 0,
                savingsRate: 0,
                topCategories: [],
                monthlyTrend: [],
            },
            spendingPatterns: {
                averageTransactionAmount: 0,
                transactionFrequency: 0,
                highestSpendingDay: 'Lundi',
                recurringExpenses: [],
            },
            recommendations: {
                budgetOptimization: [],
                savingsOpportunities: [],
                riskAreas: [],
            },
        };
    }

    async getPersonalizedRecommendations(user: User, limit: number = 10): Promise<PersonalizedRecommendations> {
        try {
            const preferences = await this.analyzeUserPreferences(user);

            // Recommander des articles basés sur les catégories de dépenses principales
            const topCategories = preferences.financialProfile.topCategories.map((c) => c.category);

            const articles = await this.articleRepository
                .createQueryBuilder('article')
                .leftJoinAndSelect('article.category', 'category')
                .where('category.title IN (:...categories)', {
                    categories: topCategories.length > 0 ? topCategories : ['Budget', 'Épargne'],
                })
                .orderBy('article.views', 'DESC')
                .limit(Math.ceil(limit / 2))
                .getMany();

            const challengeCategories = ['Budget'];
            if (preferences.financialProfile.savingsRate < 10) {
                challengeCategories.push('Épargne');
            }
            if (preferences.recommendations.riskAreas.length > 0) {
                challengeCategories.push('Finance');
            }

            const challenges = await this.challengeRepository
                .createQueryBuilder('challenge')
                .where('challenge.category IN (:...categories)', { categories: challengeCategories })
                .orderBy('challenge.creation_date', 'DESC')
                .limit(Math.ceil(limit / 2))
                .getMany();

            return {
                articles,
                challenges,
                quizz: [],
            };
        } catch (error) {
            this.logger.error(
                `Error getting personalized recommendations for user ${user.id}: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }
}
