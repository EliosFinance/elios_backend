import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { User } from '../../users/entities/user.entity';
import { AppStatusDto, ResetPinDto, SetupPinDto, VerifyPinDto } from '../dto/pin-auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AppSessionService } from '../services/app-session.service';
import { PinAuthService } from '../services/pin-auth.service';

@ApiTags('Pin Auth')
@Controller('auth/pin')
export class PinAuthController {
    constructor(
        private readonly pinAuthService: PinAuthService,
        private readonly appSessionService: AppSessionService,
    ) {}

    @Post('setup')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Set up a new PIN for the authenticated user' })
    @ApiResponse({ status: 201, description: 'PIN successfully set up' })
    @ApiResponse({ status: 400, description: 'Invalid PIN format or length' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async setupPin(@UserFromRequest() user: User, @Body() setupPinDto: SetupPinDto) {
        return this.pinAuthService.setupPin(user.id, setupPinDto);
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Verify PIN after app reopen' })
    @ApiResponse({ status: 200, description: 'PIN verified successfully' })
    @ApiResponse({ status: 401, description: 'Invalid PIN or locked account' })
    async verifyPin(
        @UserFromRequest() user: User,
        @Body() body: VerifyPinDto & AppStatusDto,
        @Headers('authorization') authorization: string,
    ) {
        const { pin, deviceId } = body;
        const token = authorization.split(' ')[1];
        return this.pinAuthService.verifyPinAfterAppReopen(user.id, deviceId, { pin }, token);
    }

    @Post('reset')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Reset PIN for the authenticated user' })
    @ApiResponse({ status: 200, description: 'PIN reset successful' })
    @ApiResponse({ status: 400, description: 'Invalid PIN format or length' })
    @ApiResponse({ status: 401, description: 'Current PIN is incorrect' })
    async resetPin(@UserFromRequest() user: User, @Body() resetPinDto: ResetPinDto) {
        return this.pinAuthService.resetPin(user.id, resetPinDto);
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Check PIN setup status for the authenticated user' })
    @ApiResponse({
        status: 200,
        description: 'PIN status',
        schema: {
            properties: {
                isSetup: { type: 'boolean' },
                isLocked: { type: 'boolean' },
            },
        },
    })
    async getPinStatus(@UserFromRequest() user: User) {
        const isSetup = await this.pinAuthService.isPinSetup(user.id);
        const isLocked = await this.pinAuthService.isPinLocked(user.id);
        return { isSetup, isLocked };
    }

    @Post('generate-device')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Generate a new device ID' })
    @ApiResponse({ status: 200, description: 'Device ID generated successfully' })
    async generateDeviceId() {
        const deviceId = this.appSessionService.generateDeviceId();
        return { deviceId };
    }

    @Get('config')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get PIN configuration' })
    @ApiResponse({
        status: 200,
        description: 'PIN configuration',
        schema: {
            properties: {
                pinLength: { type: 'number' },
                maxAttempts: { type: 'number' },
            },
        },
    })
    async getPinConfig() {
        const config = {
            pinLength: this.pinAuthService['pinLength'],
            maxAttempts: this.pinAuthService['maxAttempts'],
        };
        return config;
    }
}
