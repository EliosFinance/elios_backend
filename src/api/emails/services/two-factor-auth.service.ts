import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import { TwoFactorAuth } from '@src/api/emails/entities/two-factor-auth.entity';
import { EmailService } from '@src/api/emails/services/email.service';
import { User } from '@src/api/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TwoFactorAuthService {
    private readonly logger = new Logger(TwoFactorAuthService.name);

    constructor(
        @InjectRepository(TwoFactorAuth)
        private readonly twoFactorAuthRepository: Repository<TwoFactorAuth>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
    ) {}

    async send2FACode(user: User, purpose: string = 'login'): Promise<void> {
        if (user.provider === 'google') {
            this.logger.log(`Skipping 2FA for Google user: ${user.email}`);
            return;
        }

        await this.twoFactorAuthRepository.delete({
            user: { id: user.id },
            isUsed: false,
        });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const twoFactorAuth = this.twoFactorAuthRepository.create({
            user,
            code,
            purpose,
            expiresAt,
            metadata: {
                ipAddress: 'unknown',
                userAgent: 'unknown',
            },
        });

        await this.twoFactorAuthRepository.save(twoFactorAuth);

        await this.emailService.sendEmail({
            to: user.email,
            templateType: EmailTemplateType.TWO_FACTOR_AUTH,
            variables: {
                username: user.username,
                code,
                purpose,
                expiresIn: '10 minutes',
            },
            userId: user.id,
            metadata: {
                purpose,
                codePrefix: code.substring(0, 2) + '****',
            },
        });

        this.logger.log(`2FA code sent to ${user.email} for purpose: ${purpose}`);
    }

    async verify2FACode(user: User, code: string, purpose: string = 'login'): Promise<boolean> {
        const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
            where: {
                user: { id: user.id },
                code,
                purpose,
                isUsed: false,
            },
            relations: ['user'],
        });

        if (!twoFactorAuth) {
            throw new NotFoundException('Invalid or expired 2FA code');
        }

        if (twoFactorAuth.expiresAt < new Date()) {
            throw new BadRequestException('2FA code has expired');
        }

        twoFactorAuth.isUsed = true;
        twoFactorAuth.usedAt = new Date();
        await this.twoFactorAuthRepository.save(twoFactorAuth);

        this.logger.log(`2FA code verified successfully for user: ${user.email}`);
        return true;
    }

    private getPurposeText(purpose: string): string {
        const purposes = {
            login: 'connexion à votre compte',
            sensitive_action: 'action sensible',
            account_recovery: 'récupération de compte',
        };
        return purposes[purpose] || purpose;
    }
}
