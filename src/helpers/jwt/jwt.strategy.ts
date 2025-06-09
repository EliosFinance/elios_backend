import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as process from 'process';
import { JwtPayload } from '../../api/auth/jwt-payload.interface';
import { JwtRefreshTokenStrategy } from '../../api/auth/strategy/jwt-refresh-token.strategy';
import { UsersService } from '../../api/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtRefreshTokenStrategy.name);
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secret',
        });
    }

    async validate(payload: JwtPayload): Promise<any> {
        const user = await this.usersService.findOne(payload.sub);
        if (!user) {
            this.logger.error('User not found');
            throw new UnauthorizedException();
        }
        return user;
    }
}
