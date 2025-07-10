import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

import { EmailLog } from './entities/email-log.entity';
// Entities
import { EmailTemplate } from './entities/email-template.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { TwoFactorAuth } from './entities/two-factor-auth.entity';

import { EmailVerificationService } from './services/email-verification.service';
// Services
import { EmailService } from './services/email.service';
import { PremiumMarketingService } from './services/premium-marketing.service';
import { TwoFactorAuthService } from './services/two-factor-auth.service';

import { EmailTemplatesController } from '@src/api/emails/controllers/email-templates.controller';
import { EmailVerificationController } from '@src/api/emails/controllers/email-verification.controller';
import { PremiumMarketingController } from '@src/api/emails/controllers/premium-marketing.controller';
import { TwoFactorAuthController } from '@src/api/emails/controllers/two-factor-auth.controller';
// Controllers
import { EmailController } from './controllers/email.controller';

@Module({
    imports: [TypeOrmModule.forFeature([EmailTemplate, EmailLog, EmailVerification, TwoFactorAuth, User])],
    controllers: [
        EmailController,
        EmailTemplatesController,
        EmailVerificationController,
        TwoFactorAuthController,
        PremiumMarketingController,
    ],
    providers: [
        EmailService,
        EmailVerificationService,
        TwoFactorAuthService,
        PremiumMarketingService,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
    ],
    exports: [EmailService, EmailVerificationService, TwoFactorAuthService, PremiumMarketingService],
})
export class EmailsModule {}
