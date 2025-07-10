import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { EmailLog } from '../entities/email-log.entity';
import { EmailVerification } from '../entities/email-verification.entity';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';

@Injectable()
export class EmailCleanupJob {
    private readonly logger = new Logger(EmailCleanupJob.name);

    constructor(
        @InjectRepository(EmailLog)
        private readonly emailLogRepository: Repository<EmailLog>,
        @InjectRepository(EmailVerification)
        private readonly emailVerificationRepository: Repository<EmailVerification>,
        @InjectRepository(TwoFactorAuth)
        private readonly twoFactorAuthRepository: Repository<TwoFactorAuth>,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanupExpiredTokens() {
        this.logger.log('Starting email cleanup job...');

        const now = new Date();

        // Nettoyer les tokens de vérification expirés
        const expiredVerifications = await this.emailVerificationRepository.delete({
            expiresAt: LessThan(now),
            isVerified: false,
        });

        // Nettoyer les codes 2FA expirés
        const expired2FA = await this.twoFactorAuthRepository.delete({
            expiresAt: LessThan(now),
            isUsed: false,
        });

        // Nettoyer les logs d'email anciens (garder 90 jours)
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 90);

        const oldLogs = await this.emailLogRepository.delete({
            createdAt: LessThan(oldDate),
        });

        this.logger.log(`Cleanup completed:
            - Expired verifications: ${expiredVerifications.affected}
            - Expired 2FA codes: ${expired2FA.affected}
            - Old email logs: ${oldLogs.affected}`);
    }
}
