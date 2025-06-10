import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export enum AnalysisPeriod {
    WEEK = 'week',
    MONTH = 'month',
    QUARTER = 'quarter',
    YEAR = 'year',
}

export enum RecommendationPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export enum RiskSeverity {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export class CategorySpendingDto {
    @ApiProperty({ description: 'Category name', example: 'Alimentation' })
    category: string;

    @ApiProperty({ description: 'Amount spent in euros', example: 450.5 })
    amount: number;

    @ApiProperty({ description: 'Percentage of total expenses', example: 25.5 })
    percentage: number;

    @ApiProperty({ description: 'Number of transactions', example: 15 })
    transactionCount: number;
}

export class MonthlySpendingDto {
    @ApiProperty({ description: 'Month in YYYY-MM format', example: '2024-12' })
    month: string;

    @ApiProperty({ description: 'Total income for the month', example: 2500.0 })
    income: number;

    @ApiProperty({ description: 'Total expenses for the month', example: 2100.0 })
    expenses: number;

    @ApiProperty({ description: 'Net savings for the month', example: 400.0 })
    savings: number;
}

export class RecurringExpenseDto {
    @ApiProperty({ description: 'Description of the expense', example: 'Netflix subscription' })
    description: string;

    @ApiProperty({ description: 'Amount in euros', example: 15.99 })
    amount: number;

    @ApiProperty({ description: 'Frequency of the expense', example: 'monthly' })
    frequency: 'weekly' | 'monthly' | 'quarterly';

    @ApiProperty({ description: 'Category of the expense', example: 'Loisirs' })
    category: string;
}

export class BudgetRecommendationDto {
    @ApiProperty({ description: 'Category to optimize', example: 'Transport' })
    category: string;

    @ApiProperty({ description: 'Current spending amount', example: 300.0 })
    currentSpending: number;

    @ApiProperty({ description: 'Recommended budget', example: 240.0 })
    recommendedBudget: number;

    @ApiProperty({ description: 'Potential savings', example: 60.0 })
    potentialSavings: number;

    @ApiProperty({ description: 'Priority level', enum: RecommendationPriority })
    priority: RecommendationPriority;

    @ApiProperty({ description: 'Detailed description', example: 'Consider carpooling or public transport' })
    description: string;
}

export class SavingsOpportunityDto {
    @ApiProperty({ description: 'Type of savings opportunity', example: 'Automatic savings' })
    type: string;

    @ApiProperty({ description: 'Detailed description' })
    description: string;

    @ApiProperty({ description: 'Potential savings amount', example: 200.0 })
    potentialSavings: number;

    @ApiProperty({ description: 'Implementation difficulty', example: 'easy' })
    difficulty: 'easy' | 'medium' | 'hard';

    @ApiProperty({ description: 'Expected timeframe', example: '1 month' })
    timeframe: string;
}

export class RiskAreaDto {
    @ApiProperty({ description: 'Type of risk', example: 'Low savings rate' })
    type: string;

    @ApiProperty({ description: 'Risk description' })
    description: string;

    @ApiProperty({ description: 'Severity level', enum: RiskSeverity })
    severity: RiskSeverity;

    @ApiProperty({ description: 'Suggested action' })
    suggestion: string;
}

export class FinancialProfileDto {
    @ApiProperty({ description: 'Total income', example: 3000.0 })
    totalIncome: number;

    @ApiProperty({ description: 'Total expenses', example: 2400.0 })
    totalExpenses: number;

    @ApiProperty({ description: 'Savings rate percentage', example: 20.0 })
    savingsRate: number;

    @ApiProperty({ description: 'Top spending categories', type: [CategorySpendingDto] })
    topCategories: CategorySpendingDto[];

    @ApiProperty({ description: 'Monthly spending trend', type: [MonthlySpendingDto] })
    monthlyTrend: MonthlySpendingDto[];
}

export class SpendingPatternsDto {
    @ApiProperty({ description: 'Average transaction amount', example: 45.5 })
    averageTransactionAmount: number;

    @ApiProperty({ description: 'Number of transactions', example: 85 })
    transactionFrequency: number;

    @ApiProperty({ description: 'Day with highest spending', example: 'Samedi' })
    highestSpendingDay: string;

    @ApiProperty({ description: 'Recurring expenses', type: [RecurringExpenseDto] })
    recurringExpenses: RecurringExpenseDto[];
}

export class RecommendationsDto {
    @ApiProperty({ description: 'Budget optimization suggestions', type: [BudgetRecommendationDto] })
    budgetOptimization: BudgetRecommendationDto[];

    @ApiProperty({ description: 'Savings opportunities', type: [SavingsOpportunityDto] })
    savingsOpportunities: SavingsOpportunityDto[];

    @ApiProperty({ description: 'Risk areas to address', type: [RiskAreaDto] })
    riskAreas: RiskAreaDto[];
}

export class UserPreferencesDto {
    @ApiProperty({ description: 'Financial profile analysis', type: FinancialProfileDto })
    financialProfile: FinancialProfileDto;

    @ApiProperty({ description: 'Spending patterns analysis', type: SpendingPatternsDto })
    spendingPatterns: SpendingPatternsDto;

    @ApiProperty({ description: 'Personalized recommendations', type: RecommendationsDto })
    recommendations: RecommendationsDto;
}

export class InsightsDto {
    @ApiProperty({ description: 'User summary as array of strings', type: [String] })
    summary: string[];

    @ApiProperty({ description: 'Recommendations as array of strings', type: [String] })
    recommendations: string[];

    @ApiProperty({ description: 'Motivational message' })
    motivationalMessage: string;

    @ApiProperty({ description: 'Financial health score', minimum: 0, maximum: 100 })
    financialScore: number;

    @ApiProperty({ description: 'Advanced insights as array of strings', type: [String] })
    advancedInsights: string[];
}

export class FinancialScoreResponseDto {
    @ApiProperty({ description: 'Financial score', minimum: 0, maximum: 100, example: 75 })
    score: number;

    @ApiProperty({ description: 'Skill level', example: 'Avancé' })
    level: string;

    @ApiProperty({ description: 'Score breakdown' })
    breakdown: {
        savingsRate: number;
        categoryDiversification: number;
        riskFactors: number;
        budgetOptimization: number;
    };

    @ApiProperty({ description: 'Improvement suggestions', type: [String] })
    improvements: string[];

    @ApiProperty({ description: 'Generated timestamp' })
    generatedAt: Date;
}

export class PersonalizedContentDto {
    @ApiProperty({ description: 'Recommended articles', type: [Object] })
    articles: any[];

    @ApiProperty({ description: 'Recommended challenges', type: [Object] })
    challenges: any[];

    @ApiProperty({ description: 'Recommended quizzes', type: [Object] })
    quizz: any[];

    @ApiProperty({ description: 'Recommendation algorithm used', example: 'content-based' })
    algorithm: string;

    @ApiProperty({ description: 'Explanation of recommendations' })
    explanation: string;

    @ApiProperty({ description: 'User ID' })
    userId: number;

    @ApiProperty({ description: 'Generation timestamp' })
    generatedAt: Date;

    @ApiProperty({ description: 'Total count of recommendations' })
    totalCount: number;

    @ApiProperty({ description: 'Requested limit' })
    requestedLimit: number;
}

export class GetRecommendationsQueryDto {
    @ApiPropertyOptional({ description: 'Number of days to analyze', minimum: 1, maximum: 365, default: 30 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(365)
    daysBack?: number;
}

export class GetContentQueryDto {
    @ApiPropertyOptional({ description: 'Maximum number of items to return', minimum: 1, maximum: 50, default: 10 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(50)
    limit?: number;
}

export class GetSpendingAnalysisQueryDto {
    @ApiPropertyOptional({
        description: 'Analysis period',
        enum: AnalysisPeriod,
        default: AnalysisPeriod.MONTH,
    })
    @IsOptional()
    @IsEnum(AnalysisPeriod)
    period?: AnalysisPeriod;
}
