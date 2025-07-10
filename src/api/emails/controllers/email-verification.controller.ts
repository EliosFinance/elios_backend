import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/api/auth/decorator/public.decorator';
import { JwtAuthGuard } from '@src/api/auth/guards/jwt-auth.guard';
import { VerifyEmailDto } from '@src/api/emails/dto/email.dto';
import { User } from '@src/api/users/entities/user.entity';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { EmailVerificationService } from '../services/email-verification.service';

@ApiTags('Email Verification')
@Controller('email-verification')
export class EmailVerificationController {
    constructor(private readonly emailVerificationService: EmailVerificationService) {}

    @Post('send')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Send email verification' })
    async sendVerificationEmail(@UserFromRequest() user: User) {
        const result = await this.emailVerificationService.sendVerificationEmail(user);
        return {
            message: result
                ? 'Verification email sent successfully'
                : 'Email verification not required for Google users',
            sent: !!result,
        };
    }

    @Post('verify')
    @Public()
    @ApiOperation({ summary: 'Verify email with token' })
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        return this.emailVerificationService.verifyEmail(verifyEmailDto.token);
    }

    @Post('resend')
    @Public()
    @ApiOperation({ summary: 'Resend verification email' })
    async resendVerificationEmail(@Body() body: { email: string }) {
        await this.emailVerificationService.resendVerificationEmail(body.email);
        return { message: 'Verification email sent successfully' };
    }
}
