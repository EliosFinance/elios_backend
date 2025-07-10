import * as crypto from 'crypto';
import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '@src/api/auth/auth.service';
import { Public } from '@src/api/auth/decorator/public.decorator';
import { RefreshTokenDto } from '@src/api/auth/dto/refresh-token.dto';
import { SignInDto } from '@src/api/auth/dto/sign-in.dto';
import { JwtAuthGuard } from '@src/api/auth/guards/jwt-auth.guard';
import { JwtRefreshTokenGuard } from '@src/api/auth/guards/jwt-refresh-token.guard';
import { LocalAuthGuard } from '@src/api/auth/guards/local-auth.guard';
import { RegisterUserDto } from '@src/api/users/dto/register-user.dto';
import { UsersService } from '@src/api/users/users.service';
import { RequestResetPasswordDto } from '../dto/RequestResetPassword.dto';
import { ResetPasswordDto } from '../dto/ResetPassword.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Public()
    @Post('sign-up')
    async signUp(@Body() registerUserDto: RegisterUserDto) {
        return this.usersService.create(registerUserDto);
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('sign-in')
    async signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    @Public()
    @Post('google')
    async googleLogin(@Body('token') token: string) {
        return this.authService.googleLogin(token);
    }

    @Public()
    @UseGuards(JwtRefreshTokenGuard)
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshAccessToken(refreshTokenDto.refresh_token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('invalidate-token')
    async invalidateToken(@Headers('authorization') authorization: string) {
        const token = authorization.split(' ')[1];
        await this.authService.invalidateToken(token);
        return { message: 'Token invalidated successfully' };
    }

    @Public()
    @Post('request-reset-password')
    async requestResetPassword(@Body() dto: RequestResetPasswordDto) {
        await this.authService.requestResetPassword(dto.email);
        // Toujours retourner un succès pour ne pas révéler si l'email existe
        return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }

    @Public()
    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto.token, dto.newPassword);
        return { message: 'Mot de passe réinitialisé avec succès.' };
    }

    @Public()
    @Post('validate-reset-token')
    async validateResetToken(@Body('token') token: string) {
        try {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const alreadyUsed = await this.authService['usedResetTokenRepo'].findOne({ where: { tokenHash } });
            if (alreadyUsed) throw new Error('Ce lien de réinitialisation a déjà été utilisé.');
            await this.authService['jwtService'].verifyAsync(token);
            return { valid: true };
        } catch (e: any) {
            throw new BadRequestException(e.message || 'Token invalide ou expiré');
        }
    }
}
