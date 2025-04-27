import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '@src/api/auth/auth.service';
import { SetupPinDto } from '@src/api/auth/dto/pin-auth.dto';
import { PinAuth } from '@src/api/auth/entity/pin-auth.entity';
import { PinSessionService } from '@src/api/auth/services/pin-session.service';
import { User } from '@src/api/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PinAuthService {
    private readonly logger = new Logger(PinAuthService.name);

    constructor(
        @InjectRepository(PinAuth) private pinAuthRepository: Repository<PinAuth>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private authService: AuthService,
        private pinSessionService: PinSessionService,
    ) {}

    async setupPin(userId: number, setupPinDto: SetupPinDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        let pinAuth = await this.pinAuthRepository.findOne({ where: { userId } });

        if (!pinAuth) {
            pinAuth = this.pinAuthRepository.create({
                user,
                userId,
                pinLength: setupPinDto.pinLength || 6,
                maxAttempts: setupPinDto.maxAttempts || 3,
            });
        }

        if (setupPinDto.pin.length !== (pinAuth.pinLength || 6)) {
            return null;
        }
    }
}
