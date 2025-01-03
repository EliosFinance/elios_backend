import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async signIn(signInDto: SignInDto) {
        const { usernameOrEmail, password } = signInDto;

        const user = await this.usersService.findOneByUsername(usernameOrEmail);

        if (!user) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const passwordIsValid = await user.validatePassword(password);

        if (!passwordIsValid) {
            throw new UnauthorizedException('Invalid username or password');
        }

        const payload = { sub: user.id, username: user.username };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            expiresIn: '1d',
        });

        await this.refreshTokenIdsStorage.insert(user.id, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            username: user.username,
            powens_token: user.powens_token,
        };
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: [{ username: username }, { email: username }],
        });
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
}
