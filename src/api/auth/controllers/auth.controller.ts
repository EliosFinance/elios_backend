import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@src/api/auth/auth.service';
import { Public } from '@src/api/auth/decorator/public.decorator';
import { RefreshTokenDto } from '@src/api/auth/dto/refresh-token.dto';
import { SignInDto } from '@src/api/auth/dto/sign-in.dto';
import { JwtAuthGuard } from '@src/api/auth/guards/jwt-auth.guard';
import { JwtRefreshTokenGuard } from '@src/api/auth/guards/jwt-refresh-token.guard';
import { LocalAuthGuard } from '@src/api/auth/guards/local-auth.guard';
import { RegisterUserDto } from '@src/api/users/dto/register-user.dto';
import { User } from '@src/api/users/entities/user.entity';
import { UsersService } from '@src/api/users/users.service';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';

export class Verify2FADto {
    code: string;
    userId: number;
}

export class RequestPasswordResetDto {
    email: string;
}

export class SendPremiumEmailDto {
    reason?: string;
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Public()
    @Post('sign-up')
    @ApiOperation({ summary: 'Sign up with automatic email verification' })
    @ApiResponse({
        status: 201,
        description: 'User created successfully',
        schema: {
            properties: {
                user: { type: 'object' },
                emailSent: { type: 'boolean' },
                message: { type: 'string' },
            },
        },
    })
    async signUp(@Body() registerUserDto: RegisterUserDto) {
        const result = await this.authService.signUp(registerUserDto);
        return {
            user: {
                id: result.user.id,
                username: result.user.username,
                email: result.user.email,
                emailVerified: result.user.emailVerified,
                provider: result.user.provider,
            },
            emailSent: result.emailSent,
            message: result.emailSent
                ? 'Account created. Please check your email to verify your account.'
                : 'Account created and ready to use.',
        };
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('sign-in')
    @ApiOperation({ summary: 'Sign in with optional 2FA' })
    @ApiResponse({
        status: 200,
        description: 'Sign in successful or 2FA required',
        schema: {
            oneOf: [
                {
                    properties: {
                        id: { type: 'number' },
                        access_token: { type: 'string' },
                        refresh_token: { type: 'string' },
                        username: { type: 'string' },
                        powens_token: { type: 'string' },
                        emailVerified: { type: 'boolean' },
                    },
                },
                {
                    properties: {
                        requiresTwoFactor: { type: 'boolean', example: true },
                        userId: { type: 'number' },
                        message: { type: 'string' },
                    },
                },
            ],
        },
    })
    async signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto);
    }

    @Public()
    @Post('verify-2fa')
    @ApiOperation({ summary: 'Verify 2FA code and complete sign in' })
    @ApiResponse({ status: 200, description: '2FA verified, sign in completed' })
    async verify2FA(@Body() verify2FADto: Verify2FADto) {
        return this.authService.verify2FAAndLogin(verify2FADto.userId, verify2FADto.code);
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

    @UseGuards(JwtAuthGuard)
    @Post('send-premium-email')
    @ApiOperation({ summary: 'Send premium upgrade email to current user' })
    async sendPremiumEmail(@UserFromRequest() user: User, @Body() sendPremiumEmailDto: SendPremiumEmailDto) {
        await this.authService.sendPremiumUpgradeEmail(user.id, sendPremiumEmailDto.reason);
        return { message: 'Premium upgrade email sent successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@UserFromRequest() user: User) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
            provider: user.provider,
            pinConfigured: user.pinConfigured,
            profileComplete: user.profileComplete,
            termsAcceptedAt: user.termsAcceptedAt,
            isRegistrationComplete: user.isRegistrationComplete(),
            nextRegistrationStep: user.getNextRegistrationStep(),
        };
    }
}
