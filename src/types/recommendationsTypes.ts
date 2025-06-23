import { Article } from '@src/api/articles/entities/article.entity';
import { Challenge } from '@src/api/challenges/entities/challenge.entity';
import { Quizz } from '@src/api/quizz/entities/quizz.entity';

export type SimilarUserType = {
    userId: number;
    similarityScore: number;
    commonInterests: string[];
};

export type UserBehaviorPattern = {
    userId: number;
    timePatterns: TimePatternType[];
    sessionDuration: number;
    contentConsumptionRate: number;
    interactionQuality: number;
};

export type TimePatternType = {
    dayOfWeek: number;
    hour: number;
    frequency: number;
};

export type InsightType = {
    summary: string;
    recommendations: string[];
    trends: string[];
    behaviorPatterns: UserBehaviorPattern;
    anomalies: BehaviorAnomalyType;
    churnPrediction: ChurnPredictionType;
    optimalTiming: GetOptimalRecommendationTimingType;
};

export type RecommendationType = {
    id: number;
    userId: number;
    type: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

export type UserPreferencesType = {
    userId: number;
    favoriteCategories: CategoryPreferenceType[];
    contentTypes: ContentTypePreferenceType[];
    difficultyLevel: 'easy' | 'medium' | 'hard';
    activityScore: number;
    lastAnalyzed: Date;
};

export type CategoryPreferenceType = {
    category: string;
    score: number;
    interactionCount: number;
};

export type ContentTypePreferenceType = {
    type: 'articles' | 'challenges' | 'quizz';
    score: number;
    interactionCount: number;
};

export type BehaviorAnomalyType = {
    anomalies: string[];
    suggestions: string[];
};

export type ChurnPredictionType = {
    churnProbability: number;
    riskLevel: 'low' | 'medium' | 'high';
    reasons: string[];
    retentionActions: string[];
};

export type GetOptimalRecommendationTimingType = {
    bestTimes: { day: string; hour: number; score: number }[];
    nextRecommendationTime: Date;
    reasoning: string;
};

export type UserSpendingsPreferencesType = {
    financialProfile: {
        totalIncome: number;
        totalExpenses: number;
        savingsRate: number;
        topCategories: CategorySpending[];
        monthlyTrend: MonthlySpending[];
    };
    spendingPatterns: {
        averageTransactionAmount: number;
        transactionFrequency: number;
        highestSpendingDay: string;
        recurringExpenses: RecurringExpense[];
    };
    recommendations: {
        budgetOptimization: BudgetRecommendation[];
        savingsOpportunities: SavingsOpportunity[];
        riskAreas: RiskArea[];
    };
};

export type CategorySpending = {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
};

export type MonthlySpending = {
    month: string;
    income: number;
    expenses: number;
    savings: number;
};

export type RecurringExpense = {
    description: string;
    amount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
    category: string;
};

export type BudgetRecommendation = {
    category: string;
    currentSpending: number;
    recommendedBudget: number;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
    description: string;
};

export type SavingsOpportunity = {
    type: string;
    description: string;
    potentialSavings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    timeframe: string;
};

export type RiskArea = {
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
};

export type PersonalizedRecommendations = {
    articles: Article[];
    challenges: Challenge[];
    quizz: Quizz[];
};
