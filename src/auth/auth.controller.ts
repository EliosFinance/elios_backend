import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from 'src/users/dto/register-user.dto';
import { Public } from './decorator/public.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
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
