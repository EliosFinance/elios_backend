// src/api/recommendations/recommendations-cache.service.ts
import { Injectable } from '@nestjs/common';
import { UserPreferencesType } from '@src/types/recommendationsTypes';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

@Injectable()
export class RecommendationsCacheService {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly DEFAULT_TTL = 3600000; // 1 heure en millisecondes

    /**
     * Met en cache les préférences utilisateur
     */
    setUserPreferences(userId: number, preferences: UserPreferencesType, ttl?: number): void {
        const key = `preferences_${userId}`;
        const expiresAt = Date.now() + (ttl || this.DEFAULT_TTL);

        this.cache.set(key, {
            data: preferences,
            timestamp: Date.now(),
            expiresAt,
        });
    }

    /**
     * Récupère les préférences utilisateur du cache
     */
    getUserPreferences(userId: number): UserPreferencesType | null {
        const key = `preferences_${userId}`;
        const entry = this.cache.get(key);

        if (!entry || Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Met en cache les recommandations
     */
    setRecommendations(userId: number, type: string, recommendations: any, ttl?: number): void {
        const key = `recommendations_${userId}_${type}`;
        const expiresAt = Date.now() + (ttl || this.DEFAULT_TTL);

        this.cache.set(key, {
            data: recommendations,
            timestamp: Date.now(),
            expiresAt,
        });
    }

    /**
     * Récupère les recommandations du cache
     */
    getRecommendations(userId: number, type: string): any | null {
        const key = `recommendations_${userId}_${type}`;
        const entry = this.cache.get(key);

        if (!entry || Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Invalide le cache pour un utilisateur
     */
    invalidateUser(userId: number): void {
        const keysToDelete = Array.from(this.cache.keys()).filter(
            (key) => key.includes(`_${userId}_`) || key.endsWith(`_${userId}`),
        );

        keysToDelete.forEach((key) => this.cache.delete(key));
    }

    /**
     * Nettoie les entrées expirées
     */
    cleanup(): void {
        const now = Date.now();
        const expiredKeys = Array.from(this.cache.entries())
            .filter(([, entry]) => now > entry.expiresAt)
            .map(([key]) => key);

        expiredKeys.forEach((key) => this.cache.delete(key));
    }

    /**
     * Statistiques du cache
     */
    getStats(): {
        totalEntries: number;
        expiredEntries: number;
        hitRate: number;
        memoryUsage: string;
    } {
        const now = Date.now();
        const entries = Array.from(this.cache.values());
        const expiredEntries = entries.filter((entry) => now > entry.expiresAt).length;

        // Estimation grossière de l'utilisation mémoire
        const memoryUsage = `${Math.round(((this.cache.size * 1024) / 1024) * 100) / 100} MB`;

        return {
            totalEntries: this.cache.size,
            expiredEntries,
            hitRate: 0, // À implémenter avec un compteur de hits/misses
            memoryUsage,
        };
    }
}
