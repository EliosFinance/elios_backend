import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
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
}
