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

export type InstightType = {
    summary: string;
    recommendations: string[];
    trends: string[];
    behaviorPatterns: UserBehaviorPattern;
    anomalies;
    churnPrediction;
    optimalTiming;
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
    favoriteCategories: { category: string; score: number }[];
    contentTypes: { type: string; score: number }[];
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
