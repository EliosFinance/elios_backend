import {
    BadRequestException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
    forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '@src/api/auth/auth.service';
import { ResetPinDto, SetupPinDto, VerifyPinDto } from '@src/api/auth/dto/pin-auth.dto';
import { PinAuth } from '@src/api/auth/entities/pin-auth.entity';
import { AppSessionService } from '@src/api/auth/services/app-session.service';
import { User } from '@src/api/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class PinAuthService {
    private readonly logger = new Logger(PinAuthService.name);
    private readonly pinLength: number;
    private readonly maxAttempts: number;

    constructor(
        @InjectRepository(PinAuth) private pinAuthRepository: Repository<PinAuth>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
        private appSessionService: AppSessionService,
        private configService: ConfigService,
        private jwtService: JwtService,
    ) {
        this.pinLength = this.configService.get<number>('PIN_LENGTH', 6);
        this.maxAttempts = this.configService.get<number>('PIN_MAX_ATTEMPTS', 3);
    }

    async setupPin(userId: number, setupPinDto: SetupPinDto): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        let pinAuth = await this.pinAuthRepository.findOne({ where: { userId } });

        if (!pinAuth) {
            pinAuth = this.pinAuthRepository.create({
                user,
                userId,
                pinLength: this.pinLength,
                maxAttempts: this.maxAttempts,
            });
        }

        if (Number(setupPinDto.pin.length) !== Number(this.pinLength)) {
            throw new BadRequestException(`PIN must be ${pinAuth.pinLength || 6} digits long`);
        }

        const salt = await bcrypt.genSalt();
        const hashedPin = await bcrypt.hash(setupPinDto.pin, salt);

        pinAuth.hashedPin = hashedPin;
        pinAuth.failedAttempts = 0;
        pinAuth.isLocked = false;
        pinAuth.lastVerifiedAt = new Date();

        await this.pinAuthRepository.save(pinAuth);
        return { message: 'PIN set up successfully' };
    }

    async verifyPinAfterAppReopen(
        userId: number,
        deviceId: string,
        verifyPinDto: VerifyPinDto,
        token: string,
    ): Promise<{ valid: boolean }> {
        try {
            // Vérifier l'expiration du token
            await this.jwtService.verifyAsync(token);
        } catch (error) {
            this.logger.warn(`Token expired or invalid for user ${userId}`);
            throw new UnauthorizedException('Session expired. Please log in again.');
        }

        const pinAuth = await this.pinAuthRepository.findOne({ where: { userId } });
        if (!pinAuth) {
            throw new NotFoundException('PIN not set up for this user');
        }

        if (pinAuth.isLocked) {
            throw new UnauthorizedException('PIN is locked. Please log in again to reset.');
        }

        const appWasClosed = await this.appSessionService.isAppClosedSinceLastActive(userId, deviceId);
        if (!appWasClosed) {
            this.logger.log(`PIN verification bypassed for user ${userId} as app was not closed`);
            return { valid: true };
        }

        const isValid = await bcrypt.compare(verifyPinDto.pin, pinAuth.hashedPin);

        if (!isValid) {
            pinAuth.failedAttempts += 1;
            this.logger.warn(
                `Failed PIN attempt for user ${userId}. Attemps: ${pinAuth.failedAttempts}/${pinAuth.maxAttempts}`,
            );

            if (pinAuth.failedAttempts >= pinAuth.maxAttempts) {
                pinAuth.isLocked = true;
                await this.pinAuthRepository.save(pinAuth);

                try {
                    await this.authService.invalidateUserTokens(userId);
                    this.logger.warn(`Tokens invalidated for user ${userId} due to too many failed PIN attempts`);
                } catch (error) {
                    this.logger.warn(`Failed to invalidate tokens for user ${userId}: ${error.message}`);
                }

                throw new UnauthorizedException(
                    'Too many failed attempts. PIN is locked and tokens have been invalidated',
                );
            }

            await this.pinAuthRepository.save(pinAuth);
            throw new UnauthorizedException(
                `Invalid PIN. ${pinAuth.maxAttempts - pinAuth.failedAttempts} attempts remaining.`,
            );
        }

        pinAuth.lastVerifiedAt = new Date();
        pinAuth.failedAttempts = 0;
        await this.pinAuthRepository.save(pinAuth);

        await this.appSessionService.clearAppClosedStatus(userId, deviceId);
        await this.appSessionService.updateLastActiveTime(userId, deviceId);

        return { valid: true };
    }

    async resetPin(userId: number, resetPinDto: ResetPinDto): Promise<{ message: string }> {
        const pinAuth = await this.pinAuthRepository.findOne({ where: { userId } });
        if (!pinAuth) {
            throw new NotFoundException('PIN not set up for this user');
        }

        const isValid = await bcrypt.compare(resetPinDto.currentPin, pinAuth.hashedPin);
        if (!isValid) {
            throw new UnauthorizedException('Current PIN is incorrect');
        }

        if (resetPinDto.newPin.length !== this.pinLength) {
            throw new BadRequestException(`PIN must be ${pinAuth.pinLength} digits long`);
        }

        const salt = await bcrypt.genSalt();
        const hashedPin = await bcrypt.hash(resetPinDto.newPin, salt);

        pinAuth.hashedPin = hashedPin;
        pinAuth.failedAttempts = 0;
        pinAuth.isLocked = false;
        pinAuth.lastVerifiedAt = new Date();

        await this.pinAuthRepository.save(pinAuth);
        return { message: 'PIN reset successfully' };
    }

    async unlockPin(userId: number): Promise<{ message: string }> {
        const pinAuth = await this.pinAuthRepository.findOne({ where: { userId } });
        if (!pinAuth) {
            throw new NotFoundException('PIN not set up for this user');
        }

        pinAuth.failedAttempts = 0;
        pinAuth.isLocked = false;

        await this.pinAuthRepository.save(pinAuth);
        return { message: 'PIN unlocked successfully' };
    }

    async isPinSetup(userId: number): Promise<boolean> {
        const pinAuth = await this.pinAuthRepository.findOne({ where: { userId } });
        return !!pinAuth && !!pinAuth.hashedPin;
    }

    async isPinLocked(userId: number): Promise<boolean> {
        const pinAuth = await this.pinAuthRepository.findOne({ where: { userId } });
        if (!pinAuth) {
            return false;
        }
        return pinAuth.isLocked;
    }

    async isPinVerificationRequired(userId: number, deviceId: string): Promise<boolean> {
        const isPinSetup = await this.isPinSetup(userId);
        if (!isPinSetup) {
            return false;
        }

        const appWasClosed = await this.appSessionService.isAppClosedSinceLastActive(userId, deviceId);
        return appWasClosed;
    }
}
