import { Inject, Injectable, Logger, UnauthorizedException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { RegisterUserDto } from '../users/dto/register-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { PinAuthService } from './services/pin-auth.service';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';

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
    ) {
        // @ts-ignore
        this.googleClient = new OAuth2Client(
            '149551028707-1h2kuhoqqmr40rfh8g8f6pjc2umc0kha.apps.googleusercontent.com',
        );
    }

    async signIn(signInDto: SignInDto) {
        const { usernameOrEmail, password } = signInDto;

        const user = await this.usersService.findOneByUsernameOrEmail(usernameOrEmail);

        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const passwordIsValid = await user.validatePassword(password);

        if (!passwordIsValid) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // Vérifier si le PIN est configuré avant d'essayer de le débloquer
        const isPinSetup = await this.pinAuthService.isPinSetup(user.id);
        if (isPinSetup) {
            // Débloquer le PIN lors de la connexion seulement s'il est configuré
            await this.pinAuthService.unlockPin(user.id);
        }

        if (!user.powens_token) {
            const payloadForPowens = {
                client_id: process.env.POWENS_CLIENT_ID,
                client_secret: process.env.POWENS_CLIENT_SECRET,
            };

            try {
                const response = await axios.post(
                    `${process.env.POWENS_CLIENT_URL}auth/init`,
                    payloadForPowens,
                );
                const { auth_token, id_user } = response.data;
                console.log(auth_token, id_user);
                user.powens_token = auth_token;
                user.powens_id = id_user;
                await this.usersService.updateUser(user.id, {
                    powens_token: auth_token,
                    powens_id: id_user,
                });
            } catch (error) {
                console.error('Error during Powens API call: ', error);
                throw new Error('Failed to initialize Powens auth token');
            }
        }

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
        };
    }

    async googleLogin(googleToken: string) {
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
        let user = await this.usersService.findOneByUsernameOrEmail(email);
        if (!user) {
            const username = email.split('@')[0];
            const randomPassword = Math.random().toString(36).slice(-8);

            const payloadForPowens = {
                client_id: process.env.POWENS_CLIENT_ID,
                client_secret: process.env.POWENS_CLIENT_SECRET,
            };

            try {
                const response = await axios.post(
                    `${process.env.POWENS_CLIENT_URL}auth/init`,
                    payloadForPowens,
                );
                const { auth_token, id_user } = response.data;
                const powens_token = auth_token;
                const powens_id = id_user;
                const registerUserDto: RegisterUserDto = {
                    username,
                    email,
                    password: randomPassword,
                    powens_token: powens_token,
                };
                user = await this.usersService.create(registerUserDto);

                const jwtPayload = { sub: user.id, username: user.username };
                const accessToken = await this.jwtService.signAsync(jwtPayload);
                const refreshToken = await this.jwtService.signAsync(jwtPayload, { expiresIn: '1d' });
                await this.refreshTokenIdsStorage.insert(user.id, refreshToken);

                return {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    username: user.username,
                    powens_token: user.powens_token, // si nécessaire dans votre cas d'usage
                };
            } catch (error) {
                console.error('Error during Powens API call: ', error);
                throw new Error('Failed to initialize Powens auth token');
            }
        }
        const jwtPayload = { sub: user.id, username: user.username };
        const accessToken = await this.jwtService.signAsync(jwtPayload);
        const refreshToken = await this.jwtService.signAsync(jwtPayload, { expiresIn: '1d' });
        await this.refreshTokenIdsStorage.insert(user.id, refreshToken);

        return {
            id: user.id,
            access_token: accessToken,
            refresh_token: refreshToken,
            username: user.username,
            powens_token: user.powens_token,
        };
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
}
