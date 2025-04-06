import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../../helpers/jwt/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import 'dotenv/config';

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, UsersService, RefreshTokenIdsStorage, LocalStrategy, JwtRefreshTokenStrategy],
    exports: [AuthService],
})
export class AuthModule {}
