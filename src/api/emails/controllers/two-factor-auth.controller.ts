import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@src/api/auth/guards/jwt-auth.guard';
import { Send2FADto, Verify2FADto } from '@src/api/emails/dto/email.dto';
import { TwoFactorAuthService } from '@src/api/emails/services/two-factor-auth.service';
import { User } from '@src/api/users/entities/user.entity';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';

@ApiTags('Two Factor Authentication')
@Controller('2fa')
export class TwoFactorAuthController {
    constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

    @Post('send')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Send 2FA code' })
    async send2FACode(@UserFromRequest() user: User, @Body() send2FADto: Send2FADto) {
        await this.twoFactorAuthService.send2FACode(user, send2FADto.purpose);
        return { message: '2FA code sent successfully' };
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Verify 2FA code' })
    async verify2FACode(@UserFromRequest() user: User, @Body() verify2FADto: Verify2FADto) {
        const isValid = await this.twoFactorAuthService.verify2FACode(user, verify2FADto.code, verify2FADto.purpose);
        return { valid: isValid, message: '2FA code verified successfully' };
    }
}
