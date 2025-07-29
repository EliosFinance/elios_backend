import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import { EmailSentEvent, EmailVerifiedEvent, TwoFactorVerifiedEvent } from '@src/api/emails/events/email.events';
import { EmailService } from '../services/email.service';

@Injectable()
export class EmailEventListener {
    private readonly logger = new Logger(EmailEventListener.name);

    constructor(private readonly emailService: EmailService) {}

    @OnEvent('email.sent')
    handleEmailSent(event: EmailSentEvent) {
        this.logger.log(`Email sent: ${event.emailId} to user ${event.userId}`);
        // Ici vous pourriez ajouter des métriques, analytics, etc.
    }

    @OnEvent('email.verified')
    async handleEmailVerified(event: EmailVerifiedEvent) {
        this.logger.log(`Email verified for user ${event.userId}: ${event.email}`);

        // Envoyer un email de bienvenue après vérification
        await this.emailService.sendEmail({
            to: event.email,
            templateType: EmailTemplateType.WELCOME,
            variables: { username: 'Utilisateur' },
            userId: event.userId,
        });
    }

    @OnEvent('2fa.verified')
    handleTwoFactorVerified(event: TwoFactorVerifiedEvent) {
        this.logger.log(`2FA verified for user ${event.userId}, purpose: ${event.purpose}`);
    }
}
