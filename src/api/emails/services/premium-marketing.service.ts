import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import { EmailService } from '@src/api/emails/services/email.service';
import { User } from '@src/api/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PremiumMarketingService {
    private readonly logger = new Logger(PremiumMarketingService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
    ) {}

    async sendPremiumUpgradeEmail(user: User, reason?: string): Promise<void> {
        const upgradeUrl = `${process.env.FRONTEND_URL}/premium/upgrade`;

        await this.emailService.sendEmail({
            to: user.email,
            templateType: EmailTemplateType.PREMIUM_UPGRADE,
            variables: {
                username: user.username,
                upgradeUrl,
                reason: reason || 'Débloquez toutes les fonctionnalités premium',
                benefits: [
                    'Analyses financières avancées',
                    'Recommandations personnalisées',
                    'Support prioritaire',
                    'Accès aux défis exclusifs',
                ],
            },
            userId: user.id,
            metadata: {
                campaignType: 'premium_upgrade',
                reason,
            },
        });

        this.logger.log(`Premium upgrade email sent to ${user.email}`);
    }

    async sendPremiumWelcomeEmail(user: User): Promise<void> {
        await this.emailService.sendEmail({
            to: user.email,
            templateType: EmailTemplateType.PREMIUM_WELCOME,
            variables: {
                username: user.username,
                dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
                premiumFeaturesUrl: `${process.env.FRONTEND_URL}/premium/features`,
            },
            userId: user.id,
            metadata: {
                campaignType: 'premium_welcome',
            },
        });

        this.logger.log(`Premium welcome email sent to ${user.email}`);
    }

    async sendPremiumTrialReminder(user: User, daysRemaining: number): Promise<void> {
        const upgradeUrl = `${process.env.FRONTEND_URL}/premium/upgrade`;

        await this.emailService.sendEmail({
            to: user.email,
            subject: `Plus que ${daysRemaining} jours de période d'essai`,
            templateType: EmailTemplateType.PREMIUM_UPGRADE,
            variables: {
                username: user.username,
                daysRemaining,
                upgradeUrl,
                urgency: daysRemaining <= 3 ? 'high' : 'medium',
            },
            userId: user.id,
            metadata: {
                campaignType: 'trial_reminder',
                daysRemaining,
            },
        });

        this.logger.log(`Trial reminder email sent to ${user.email} (${daysRemaining} days remaining)`);
    }
}
