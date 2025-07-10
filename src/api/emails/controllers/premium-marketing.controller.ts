import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/api/auth/guards/jwt-auth.guard';
import { PremiumMarketingService } from '@src/api/emails/services/premium-marketing.service';
import { User } from '@src/api/users/entities/user.entity';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';

@ApiTags('Premium Marketing')
@Controller('premium-marketing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class PremiumMarketingController {
    constructor(private readonly premiumMarketingService: PremiumMarketingService) {}

    @Post('upgrade-email')
    @ApiOperation({ summary: 'Send premium upgrade email' })
    async sendUpgradeEmail(@UserFromRequest() user: User, @Body() body: { reason?: string }) {
        await this.premiumMarketingService.sendPremiumUpgradeEmail(user, body.reason);
        return { message: 'Premium upgrade email sent successfully' };
    }

    @Post('welcome-email')
    @ApiOperation({ summary: 'Send premium welcome email' })
    async sendWelcomeEmail(@UserFromRequest() user: User) {
        await this.premiumMarketingService.sendPremiumWelcomeEmail(user);
        return { message: 'Premium welcome email sent successfully' };
    }

    @Post('trial-reminder')
    @ApiOperation({ summary: 'Send trial reminder email' })
    async sendTrialReminder(@UserFromRequest() user: User, @Body() body: { daysRemaining: number }) {
        await this.premiumMarketingService.sendPremiumTrialReminder(user, body.daysRemaining);
        return { message: 'Trial reminder email sent successfully' };
    }
}
