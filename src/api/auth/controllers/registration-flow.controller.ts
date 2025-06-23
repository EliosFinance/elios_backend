// src/api/auth/controllers/registration-flow.controller.ts
import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { User } from '../../users/entities/user.entity';
import { Public } from '../decorator/public.decorator';
import {
    AcceptTermsDto,
    UpdateProfileDto,
    UserCompletionStatusDto,
    VerifyEmailGoogleDto,
} from '../dto/registration-flow.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RegistrationFlowService } from '../services/registration-flow.service';

@ApiTags('Registration Flow')
@Controller('auth/registration')
export class RegistrationFlowController {
    constructor(private readonly registrationFlowService: RegistrationFlowService) {}

    @Get('status/:userId')
    @Public()
    @ApiOperation({ summary: 'Get user registration completion status' })
    @ApiResponse({
        status: 200,
        description: 'User registration status',
        type: UserCompletionStatusDto,
    })
    async getUserCompletionStatus(@Param('userId') userId: string): Promise<UserCompletionStatusDto> {
        return this.registrationFlowService.getUserCompletionStatus(parseInt(userId));
    }

    @Post('verify-email-google')
    @Public()
    @ApiOperation({ summary: 'Mark email as verified for Google users' })
    @ApiResponse({ status: 200, description: 'Email marked as verified' })
    async markEmailAsVerified(@Body() verifyEmailDto: VerifyEmailGoogleDto) {
        return this.registrationFlowService.markEmailAsVerified(verifyEmailDto.email);
    }

    @Post('accept-terms')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Accept terms and conditions' })
    @ApiResponse({ status: 200, description: 'Terms accepted successfully' })
    async acceptTermsAndConditions(@UserFromRequest() user: User) {
        return this.registrationFlowService.acceptTermsAndConditions(user.id);
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update user profile during registration' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    async updateUserProfile(@UserFromRequest() user: User, @Body() updateProfileDto: UpdateProfileDto) {
        return this.registrationFlowService.updateUserProfile(user.id, updateProfileDto);
    }

    @Post('mark-pin-configured')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Mark PIN as configured for user' })
    @ApiResponse({ status: 200, description: 'PIN status updated' })
    async markPinConfigured(@UserFromRequest() user: User) {
        return this.registrationFlowService.markPinConfigured(user.id);
    }
}
