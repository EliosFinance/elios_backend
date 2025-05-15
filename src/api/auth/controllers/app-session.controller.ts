import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { User } from '../../users/entities/user.entity';
import { AppStatusDto } from '../dto/pin-auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AppSessionService } from '../services/app-session.service';
import { PinAuthService } from '../services/pin-auth.service';

@ApiTags('App Session')
@Controller('auth/app')
export class AppSessionController {
    constructor(
        private readonly appSessionService: AppSessionService,
        private readonly pinAuthService: PinAuthService,
    ) {}

    @Post('open')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Record app opening and check if PIN verification is needed' })
    @ApiResponse({
        status: 200,
        description: 'App opened successfully',
        schema: {
            properties: {
                requiresPin: { type: 'boolean' },
                deviceId: { type: 'string' },
            },
        },
    })
    async appOpened(@UserFromRequest() user: User, @Body() appStatusDto: AppStatusDto) {
        const { deviceId } = appStatusDto;

        // Check if PIN verification is required
        const requiresPin = await this.pinAuthService.isPinVerificationRequired(user.id, deviceId);

        // If no PIN verification is required, update the last active time
        if (!requiresPin) {
            await this.appSessionService.updateLastActiveTime(user.id, deviceId);
            await this.appSessionService.clearAppClosedStatus(user.id, deviceId);
        }

        return {
            requiresPin,
            deviceId,
        };
    }

    @Post('close')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Record app closing' })
    @ApiResponse({ status: 200, description: 'App closed successfully' })
    async appClosed(@UserFromRequest() user: User, @Body() appStatusDto: AppStatusDto) {
        const { deviceId } = appStatusDto;

        // Record that the app was closed
        await this.appSessionService.markAppClosed(user.id, deviceId);

        return { message: 'App closed status recorded' };
    }

    @Post('keep-alive')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update last active time for the app session' })
    @ApiResponse({ status: 200, description: 'Session kept alive successfully' })
    async keepSessionAlive(@UserFromRequest() user: User, @Body() appStatusDto: AppStatusDto) {
        const { deviceId } = appStatusDto;

        // Update the last active timestamp
        await this.appSessionService.updateLastActiveTime(user.id, deviceId);

        return { message: 'Session kept alive' };
    }
}
