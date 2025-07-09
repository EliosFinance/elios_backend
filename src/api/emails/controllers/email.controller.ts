import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@src/api/auth/decorator/public.decorator';
import { JwtAuthGuard } from '@src/api/auth/guards/jwt-auth.guard';
import { EmailVerificationService } from '@src/api/emails/services/email-verification.service';
import { EmailService } from '@src/api/emails/services/email.service';
import { PremiumMarketingService } from '@src/api/emails/services/premium-marketing.service';
import { TwoFactorAuthService } from '@src/api/emails/services/two-factor-auth.service';
import { User } from '@src/api/users/entities/user.entity';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { SendEmailDto } from '../dto/email.dto';

@ApiTags('Email System')
@Controller('emails')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
        private readonly emailVerificationService: EmailVerificationService,
        private readonly twoFactorAuthService: TwoFactorAuthService,
        private readonly premiumMarketingService: PremiumMarketingService,
    ) {}

    @Post('send')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Send email with template or custom content' })
    @ApiResponse({ status: 201, description: 'Email sent successfully' })
    async sendEmail(@Body() sendEmailDto: SendEmailDto, @UserFromRequest() user: User) {
        return this.emailService.sendEmail({
            ...sendEmailDto,
            userId: user.id,
        });
    }

    @Get('logs')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get email logs for current user' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getEmailLogs(@UserFromRequest() user: User, @Query('limit') limit?: number) {
        return this.emailService.getEmailLogs(user.id, limit);
    }

    @Get('logs/all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get all email logs (admin only)' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAllEmailLogs(@Query('limit') limit?: number) {
        return this.emailService.getEmailLogs(undefined, limit);
    }

    @Post('tracking/opened/:emailId')
    @Public()
    @ApiOperation({ summary: 'Track email opened' })
    async trackEmailOpened(@Param('emailId') emailId: number) {
        await this.emailService.markEmailAsOpened(emailId);
        return { message: 'Email marked as opened' };
    }

    @Post('tracking/clicked/:emailId')
    @Public()
    @ApiOperation({ summary: 'Track email link clicked' })
    async trackEmailClicked(@Param('emailId') emailId: number) {
        await this.emailService.markEmailAsClicked(emailId);
        return { message: 'Email marked as clicked' };
    }
}
