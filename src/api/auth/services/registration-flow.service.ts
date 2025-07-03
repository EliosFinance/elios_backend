import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UpdateProfileDto, UserCompletionStatusDto } from '../dto/registration-flow.dto';

@Injectable()
export class RegistrationFlowService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async getUserCompletionStatus(userId: number): Promise<UserCompletionStatusDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: [
                'id',
                'email',
                'emailVerified',
                'username',
                'pinConfigured',
                'termsAcceptedAt',
                'profileComplete',
                'provider',
                'creation_date',
            ],
        });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        const status: UserCompletionStatusDto = {
            emailVerified: user.emailVerified || user.provider === 'google',
            pinConfigured: user.pinConfigured || false,
            termsAccepted: !!user.termsAcceptedAt,
            profileComplete: !!(user.username && user.email),
            provider: user.provider,
            registrationDate: user.creation_date,
            nextSteps: [],
        };

        if (!status.emailVerified) {
            status.nextSteps.push('email_verification');
        }
        if (!status.profileComplete) {
            status.nextSteps.push('profile_completion');
        }
        if (!status.pinConfigured) {
            status.nextSteps.push('pin_configuration');
        }
        if (!status.termsAccepted) {
            status.nextSteps.push('terms_acceptance');
        }

        return status;
    }

    async markEmailAsVerified(email: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé avec cet email');
        }

        user.emailVerified = true;
        await this.userRepository.save(user);

        return { message: 'Email marqué comme vérifié' };
    }

    async acceptTermsAndConditions(userId: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        user.termsAcceptedAt = new Date();
        await this.userRepository.save(user);

        return { message: 'Conditions générales acceptées' };
    }

    async updateUserProfile(userId: number, updateData: UpdateProfileDto): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        if (updateData.username) {
            user.username = updateData.username;
        }
        if (updateData.email) {
            user.email = updateData.email;
        }
        if (updateData.profileComplete !== undefined) {
            user.profileComplete = updateData.profileComplete;
        }

        if (user.username && user.email && !user.profileComplete) {
            user.profileComplete = true;
        }

        await this.userRepository.save(user);

        return { message: 'Profil mis à jour avec succès' };
    }

    async markPinConfigured(userId: number): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('Utilisateur non trouvé');
        }

        user.pinConfigured = true;
        await this.userRepository.save(user);

        return { message: 'PIN marqué comme configuré' };
    }
}
