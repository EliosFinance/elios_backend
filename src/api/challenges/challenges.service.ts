import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { createActor, createMachine } from 'xstate';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { User } from '../users/entities/user.entity';
import { CreateChallengeDto } from './dto/create-challenge-dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge, ChallengeType } from './entities/challenge.entity';
import { UserToChallenge } from './entities/usertochallenge.entity';

@Injectable()
export class ChallengesService {
    constructor(
        @InjectRepository(Challenge)
        private readonly challengeRepository: Repository<Challenge>,
        @InjectRepository(Enterprise)
        private readonly enterpriseRepository: Repository<Enterprise>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserToChallenge)
        private readonly userToChallengeRepository: Repository<UserToChallenge>,
    ) {}

    async findFullOne(id: number): Promise<Challenge> {
        const challenge = await this.challengeRepository.findOne({
            where: { id: id },
            relations: ['enterprise', 'userToChallenge', 'userToChallenge.user'],
        });

        if (!challenge) {
            throw new NotFoundException(`The challenge with ID ${id} not found`);
        }

        return challenge;
    }

    async create(createChallengeDto: CreateChallengeDto): Promise<ChallengeType> {
        const { title, description, image, enterpriseId, category, stateMachineConfig } = createChallengeDto;

        const enterprise = await this.enterpriseRepository.findOneBy({ id: enterpriseId });
        if (!enterprise) {
            throw new NotFoundException('Enterprise not found');
        }

        const newChallenge = this.challengeRepository.create({
            title,
            description,
            image,
            enterprise,
            category,
            stateMachineConfig: stateMachineConfig,
        });

        return this.challengeRepository.save(newChallenge);
    }

    async findAll(): Promise<ChallengeType[]> {
        return this.challengeRepository.find({
            relations: ['enterprise', 'userToChallenge', 'userToChallenge.user'],
            // omit the stateMachineConfig field
            select: [
                'id',
                'title',
                'description',
                'image',
                'userToChallenge',
                'enterprise',
                'category',
                'creation_date',
                'update_date',
            ],
        });
    }

    async findOne(id: number): Promise<ChallengeType> {
        const challenge = await this.challengeRepository.findOne({
            where: { id: id },
            relations: ['enterprise', 'userToChallenge', 'userToChallenge.user'],
        });

        if (!challenge) {
            throw new NotFoundException(`The challenge with ID ${id} not found`);
        }

        return challenge;
    }

    async update(id: number, updateChallengeDto: UpdateChallengeDto): Promise<ChallengeType> {
        const challenge = await this.findOne(id);

        Object.assign(challenge, updateChallengeDto);

        return this.challengeRepository.save(challenge);
    }

    async remove(id: number): Promise<void> {
        const challenge = await this.findFullOne(id);
        await this.challengeRepository.remove(challenge);
    }

    async getUserChallenge(userId: number, challengeId: number): Promise<UserToChallenge> {
        return await this.userToChallengeRepository.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });
    }

    async updateUserChallengeState(userChallenge: UserToChallenge): Promise<UserToChallenge> {
        return await this.userToChallengeRepository.save(userChallenge);
    }

    async addUserToChallenge(userId: number, challengeId: number): Promise<UserToChallenge> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const challenge = await this.findFullOne(challengeId);
        if (!challenge) {
            throw new NotFoundException('Challenge not found');
        }

        const userChallenge = this.userToChallengeRepository.create({
            user,
            challenge,
            currentState: challenge.stateMachineConfig.initial,
        });

        return this.userToChallengeRepository.save(userChallenge);
    }
}
