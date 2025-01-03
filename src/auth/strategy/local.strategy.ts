import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { JwtRefreshTokenStrategy } from './jwt-refresh-token.strategy';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtRefreshTokenStrategy.name);

    constructor(private authService: AuthService) {
        super({ usernameField: 'usernameOrEmail' });
        this.logger.warn('LocalStrategy initialized');
    }

    async validate(usernameOrEmail: string, password: string): Promise<any> {
        console.log('usernameOrEmail', usernameOrEmail, password);
        const user = await this.authService.validateUser(usernameOrEmail, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
