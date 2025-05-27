import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '@src/api/auth/controllers/auth.controller';
import { User } from '@src/api/users/entities/user.entity';
import { JwtStrategy } from '@src/helpers/jwt/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { AppSessionController } from '@src/api/auth/controllers/app-session.controller';
import { PinAuthController } from '@src/api/auth/controllers/pin-auth.controller';
import { PinAuth } from '@src/api/auth/entities/pin-auth.entity';
import { AppSessionService } from '@src/api/auth/services/app-session.service';
import { PinAuthService } from '@src/api/auth/services/pin-auth.service';

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature([User, PinAuth]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController, PinAuthController, AppSessionController],
    providers: [
        AuthService,
        PinAuthService,
        JwtStrategy,
        UsersService,
        RefreshTokenIdsStorage,
        LocalStrategy,
        JwtRefreshTokenStrategy,
        AppSessionService,
        ConfigService,
    ],
    exports: [AuthService, PinAuthService, AppSessionService],
})
export class AuthModule {}
