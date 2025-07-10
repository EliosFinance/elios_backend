import * as crypto from 'crypto';
import { Inject, Injectable, Logger, UnauthorizedException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from '@src/api/users/dto/register-user.dto';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RequestResetPasswordDto } from './dto/RequestResetPassword.dto';
import { ResetPasswordDto } from './dto/ResetPassword.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UsedResetToken } from './entities/used-reset-token.entity';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { PinAuthService } from './services/pin-auth.service';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';

import { EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import { EmailVerificationService } from '@src/api/emails/services/email-verification.service';
import { EmailService } from '@src/api/emails/services/email.service';
import { PremiumMarketingService } from '@src/api/emails/services/premium-marketing.service';
import { TwoFactorAuthService } from '@src/api/emails/services/two-factor-auth.service';

export interface SignInResponse {
    id: number;
    access_token: string;
    refresh_token: string;
    username: string;
    powens_token: string;
    requiresTwoFactor?: boolean;
    emailVerified?: boolean;
}

export interface TwoFactorSignInResponse {
    requiresTwoFactor: true;
    userId: number;
    message: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
    private googleClient: OAuth2Client;
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
        @Inject(forwardRef(() => PinAuthService)) private readonly pinAuthService: PinAuthService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly emailService: EmailService,
        private readonly emailVerificationService: EmailVerificationService,
        private readonly twoFactorAuthService: TwoFactorAuthService,
        private readonly premiumMarketingService: PremiumMarketingService,
        @InjectRepository(UsedResetToken)
        private readonly usedResetTokenRepo: Repository<UsedResetToken>,
    ) {
        // @ts-ignore
        this.googleClient = new OAuth2Client(
            '149551028707-1h2kuhoqqmr40rfh8g8f6pjc2umc0kha.apps.googleusercontent.com',
        );
    }

    async signIn(signInDto: SignInDto): Promise<SignInResponse | TwoFactorSignInResponse> {
        const { usernameOrEmail, password } = signInDto;

        const user = await this.usersService.findOneByUsernameOrEmail(usernameOrEmail);

        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const passwordIsValid = await user.validatePassword(password);

        if (!passwordIsValid) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // Vérifier si l'email est vérifié (sauf pour Google)
        if (user.provider !== 'google' && !user.emailVerified) {
            // Renvoyer un email de vérification
            try {
                await this.emailVerificationService.sendVerificationEmail(user);
            } catch (error) {
                this.logger.error(`Failed to resend verification email: ${error.message}`);
            }

            throw new UnauthorizedException(
                'Email not verified. A new verification email has been sent to your address.',
            );
        }

        // Gestion du token Powens
        if (!user.powens_token) {
            const payloadForPowens = {
                client_id: process.env.POWENS_CLIENT_ID,
                client_secret: process.env.POWENS_CLIENT_SECRET,
            };

            try {
                const response = await axios.post(`${process.env.POWENS_CLIENT_URL}auth/init`, payloadForPowens);
                const { auth_token, id_user } = response.data;
                user.powens_token = auth_token;
                user.powens_id = id_user;
                await this.usersService.updateUser(user.id, {
                    powens_token: auth_token,
                    powens_id: id_user,
                });
            } catch (error) {
                this.logger.error('Error during Powens API call: ', error);
                throw new Error('Failed to initialize Powens auth token');
            }
        }

        // Déverrouiller le PIN si configuré
        const isPinSetup = await this.pinAuthService.isPinSetup(user.id);
        if (isPinSetup) {
            await this.pinAuthService.unlockPin(user.id);
        }

        // Gestion 2FA conditionnelle (pas pour Google OAuth)
        if (user.provider !== 'google') {
            try {
                await this.twoFactorAuthService.send2FACode(user, 'login');
                return {
                    requiresTwoFactor: true,
                    userId: user.id,
                    message: '2FA code sent to your email',
                };
            } catch (error) {
                this.logger.error(`Failed to send 2FA code: ${error.message}`);
                // Continuer la connexion normale si 2FA échoue
            }
        }

        // Connexion normale (Google ou après 2FA)
        return this.completeLogin(user);
    }

    async signUp(registerUserDto: any): Promise<{ user: User; emailSent: boolean }> {
        const user = await this.usersService.create(registerUserDto);
        let emailSent = false;

        // Envoyer email de vérification seulement si ce n'est pas Google OAuth
        if (user.provider !== 'google') {
            try {
                await this.emailVerificationService.sendVerificationEmail(user);
                emailSent = true;
                this.logger.log(`Verification email sent to ${user.email}`);
            } catch (error) {
                this.logger.error(`Failed to send verification email: ${error.message}`);
                // Ne pas faire échouer l'inscription si l'email ne peut pas être envoyé
            }
        } else {
            // Pour les utilisateurs Google, marquer comme vérifié automatiquement
            user.emailVerified = true;
            await this.userRepository.save(user);
        }

        // Envoyer email de bienvenue après inscription
        try {
            await this.emailService.sendEmail({
                to: user.email,
                templateType: EmailTemplateType.WELCOME,
                variables: {
                    username: user.username,
                    dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
                },
                userId: user.id,
                metadata: {
                    registrationMethod: user.provider,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to send welcome email: ${error.message}`);
        }

        return { user, emailSent };
    }

    async googleLogin(googleToken: string): Promise<SignInResponse> {
        let ticket;
        try {
            ticket = await this.googleClient.verifyIdToken({
                idToken: googleToken,
                audience: '149551028707-1h2kuhoqqmr40rfh8g8f6pjc2umc0kha.apps.googleusercontent.com',
            });
        } catch (error) {
            this.logger.error('Erreur lors de la vérification du token Google', error);
            throw new UnauthorizedException('Le token Google est invalide');
        }

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new UnauthorizedException("Le compte Google n'a pas d'email");
        }

        const email = payload.email;
        const googleId = payload.sub;
        let user = await this.usersService.findOneByUsernameOrEmail(email);
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            const username = email.split('@')[0];
            const randomPassword = Math.random().toString(36).slice(-8);

            const payloadForPowens = {
                client_id: process.env.POWENS_CLIENT_ID,
                client_secret: process.env.POWENS_CLIENT_SECRET,
            };

            try {
                const response = await axios.post(`${process.env.POWENS_CLIENT_URL}auth/init`, payloadForPowens);
                const { auth_token, id_user } = response.data;

                const newUser = this.userRepository.create({
                    username,
                    email,
                    password: await bcrypt.hash(randomPassword, 10),
                    powens_token: auth_token,
                    powens_id: id_user,
                    provider: 'google',
                    googleId: googleId,
                    emailVerified: true, // Auto-vérifié pour Google
                    profileComplete: false,
                    pinConfigured: false,
                    termsAcceptedAt: null,
                });

                user = await this.userRepository.save(newUser);

                // Envoyer email de bienvenue pour nouveaux utilisateurs Google
                try {
                    await this.emailService.sendEmail({
                        to: user.email,
                        templateType: EmailTemplateType.WELCOME,
                        variables: {
                            username: user.username,
                            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
                        },
                        userId: user.id,
                        metadata: {
                            registrationMethod: 'google',
                            isNewUser: true,
                        },
                    });
                } catch (error) {
                    this.logger.error(`Failed to send welcome email to Google user: ${error.message}`);
                }
            } catch (error) {
                console.error('Error during Powens API call: ', error);
                throw new Error('Failed to initialize Powens auth token');
            }
        } else {
            // Utilisateur existant - mettre à jour les infos Google si nécessaire
            if (user.provider !== 'google') {
                user.provider = 'google';
                user.googleId = googleId;
                user.emailVerified = true;
                await this.userRepository.save(user);
            }
        }

        // Déverrouiller le PIN si configuré
        const isPinSetup = await this.pinAuthService.isPinSetup(user.id);
        if (isPinSetup) {
            await this.pinAuthService.unlockPin(user.id);
        }

        this.logger.log(`Google login successful for ${user.email} (${isNewUser ? 'new' : 'existing'} user)`);
        return this.completeLogin(user);
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user && (await user.validatePassword(password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
        try {
            const decoded = await this.jwtService.verifyAsync(refreshToken);
            await this.refreshTokenIdsStorage.validate(decoded.sub, refreshToken);
            const payload = { sub: decoded.sub, username: decoded.username };
            const accessToken = await this.jwtService.signAsync(payload);
            const newRefreshToken = await this.jwtService.signAsync(payload, {
                expiresIn: '1d',
            });
            await this.invalidateToken(refreshToken);
            await this.refreshTokenIdsStorage.insert(decoded.sub, newRefreshToken);
            return {
                access_token: accessToken,
                refresh_token: newRefreshToken,
            };
        } catch (error) {
            this.logger.error(`Error: ${error.message}`);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async invalidateToken(accessToken: string): Promise<void> {
        try {
            const decoded = await this.jwtService.verifyAsync(accessToken);
            console.log(decoded);
            await this.refreshTokenIdsStorage.invalidate(decoded.sub);
        } catch (error) {
            throw new UnauthorizedException('Invalid access token');
        }
    }

    async invalidateUserTokens(userId: number): Promise<void> {
        await this.refreshTokenIdsStorage.invalidate(userId);
        this.logger.log(`All tokens invalidated for user ${userId}`);
    }

    async verify2FAAndLogin(userId: number, code: string): Promise<SignInResponse> {
        const user = await this.usersService.findOne(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Vérifier le code 2FA
        const isValid = await this.twoFactorAuthService.verify2FACode(user, code, 'login');

        if (!isValid) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        this.logger.log(`2FA verified successfully for user ${user.email}`);
        return this.completeLogin(user);
    }

    private async completeLogin(user: User): Promise<SignInResponse> {
        const payload = { sub: user.id, username: user.username };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '1d',
        });

        await this.refreshTokenIdsStorage.insert(user.id, refreshToken);

        return {
            id: user.id,
            access_token: accessToken,
            refresh_token: refreshToken,
            username: user.username,
            powens_token: user.powens_token,
            emailVerified: user.emailVerified,
        };
    }

    async sendPremiumUpgradeEmail(userId: number, reason?: string): Promise<void> {
        const user = await this.usersService.findOne(userId);
        if (user) {
            await this.premiumMarketingService.sendPremiumUpgradeEmail(user, reason);
        }
    }

    /**
     * Demande de réinitialisation de mot de passe.
     * - Ne révèle jamais si l'email existe ou non (sécurité).
     * - Génère un token JWT valable 1h.
     * - Envoie un email avec le template password_reset si l'utilisateur existe et a un email valide.
     */
    async requestResetPassword(email: string): Promise<void> {
        // Validation stricte du format d'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            // Toujours retourner sans rien révéler
            return;
        }

        // Recherche de l'utilisateur (ne jamais révéler l'existence)
        const user = await this.usersService.findOneByUsernameOrEmail(email);
        if (!user || !user.email) {
            // Toujours retourner sans rien révéler
            return;
        }

        // Génération du token JWT de reset (1h)
        const payload = { sub: user.id, email: user.email };
        const token = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${token}`;

        // Envoi de l'email avec la template password_reset
        try {
            await this.emailService.sendEmail({
                to: user.email,
                templateType: EmailTemplateType.PASSWORD_RESET,
                variables: {
                    username: user.username,
                    resetUrl: resetLink,
                    expiresIn: '1h',
                },
                userId: user.id,
                metadata: {
                    resetRequest: true,
                },
            });
            this.logger.log(`[PasswordReset] Email envoyé à ${user.email}`);
        } catch (error) {
            // Log interne, mais ne jamais révéler à l'utilisateur
            this.logger.error(`[PasswordReset] Echec d'envoi d'email: ${error.message}`);
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        let payload: any;
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        // Vérifie si le token a déjà été utilisé
        const alreadyUsed = await this.usedResetTokenRepo.findOne({ where: { tokenHash } });
        if (alreadyUsed) {
            throw new Error('Ce lien de réinitialisation a déjà été utilisé.');
        }
        try {
            payload = await this.jwtService.verifyAsync(token);
        } catch (e) {
            throw new Error('Token invalide ou expiré');
        }
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updateUser(user.id, { password: hashedPassword });
        // Blackliste le token après usage
        await this.usedResetTokenRepo.save({ tokenHash, userId: user.id });
    }
}
