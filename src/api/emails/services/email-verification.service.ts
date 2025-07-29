import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import { EmailVerification } from '@src/api/emails/entities/email-verification.entity';
import { EmailService } from '@src/api/emails/services/email.service';
import { User } from '@src/api/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailVerificationService {
    private readonly logger = new Logger(EmailVerificationService.name);

    constructor(
        @InjectRepository(EmailVerification)
        private readonly emailVerificationRepository: Repository<EmailVerification>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
    ) {}

    async sendVerificationEmail(user: User): Promise<EmailVerification> {
        if (user.provider === 'google') {
            this.logger.log(`Skipping email verification for Google user: ${user.email}`);
            return null;
        }

        if (user.emailVerified) {
            throw new BadRequestException('Email already verified');
        }

        await this.emailVerificationRepository.delete({
            user: { id: user.id },
            isVerified: false,
        });

        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const verification = this.emailVerificationRepository.create({
            user,
            token,
            email: user.email,
            expiresAt,
        });

        const savedVerification = await this.emailVerificationRepository.save(verification);

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        await this.emailService.sendEmail({
            to: user.email,
            templateType: EmailTemplateType.EMAIL_VERIFICATION,
            variables: {
                username: user.username,
                verificationUrl,
                expiresIn: '24 heures',
            },
            userId: user.id,
            metadata: {
                verificationType: 'email',
                token: token.substring(0, 8) + '...',
            },
        });

        this.logger.log(`Verification email sent to ${user.email}`);
        return savedVerification;
    }

    async verifyEmail(token: string): Promise<{ user: User; message: string }> {
        const verification = await this.emailVerificationRepository.findOne({
            where: { token, isVerified: false },
            relations: ['user'],
        });

        if (!verification) {
            throw new NotFoundException('Invalid or expired verification token');
        }

        if (verification.expiresAt < new Date()) {
            throw new BadRequestException('Verification token has expired');
        }

        verification.isVerified = true;
        verification.verifiedAt = new Date();
        await this.emailVerificationRepository.save(verification);

        verification.user.emailVerified = true;
        const updatedUser = await this.userRepository.save(verification.user);

        await this.emailService.sendEmail({
            to: verification.user.email,
            templateType: EmailTemplateType.ACCOUNT_ACTIVATED,
            variables: {
                username: verification.user.username,
            },
            userId: verification.user.id,
        });

        this.logger.log(`Email verified successfully for user: ${verification.user.email}`);

        return {
            user: updatedUser,
            message: 'Email verified successfully',
        };
    }

    async resendVerificationEmail(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.emailVerified) {
            throw new BadRequestException('Email already verified');
        }

        await this.sendVerificationEmail(user);
    }
}
