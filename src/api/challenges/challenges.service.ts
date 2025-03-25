import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { toUserLight } from '../users/dto/user.utils';
import { User } from '../users/entities/user.entity';
import { AddUsersDto } from './dto/add-users.dto';
import { CreateChallengeDto } from './dto/create-challenge-dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';
import { ChallengeStatus, UserToChallenge } from './entities/usertochallenge.entity';

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

    async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
        const { title, description, image, enterpriseId, category } = createChallengeDto;

        const enterprise = await this.enterpriseRepository.findOneBy({ id: enterpriseId });
        if (!enterprise) {
            throw new NotFoundException('The enterprise was no found enterprises not found');
        }

        const newChallenge = this.challengeRepository.create({
            title,
            description,
            image,
            enterprise,
            category,
        });

        return this.challengeRepository.save(newChallenge);
    }

    async findAll(): Promise<any[]> {
        const challenges = await this.challengeRepository.find({
            relations: ['enterprise', 'userToChallenge', 'userToChallenge.user'],
        });

        return challenges.map((challenge) => ({
            ...challenge,
            userToChallenge: challenge.userToChallenge.map((userToChallenge) => ({
                ...userToChallenge,
                user: toUserLight(userToChallenge.user),
            })),
        }));
    }

    async findOne(id: number): Promise<any> {
        const challenge = await this.challengeRepository.findOne({
            where: { id: id },
            relations: ['enterprise', 'userToChallenge', 'userToChallenge.user'],
        });

        if (!challenge) {
            throw new NotFoundException(`The challenge with ID ${id} not found`);
        }

        const userToChallengeWithLightUser = challenge.userToChallenge.map((userToChallenge) => {
            return {
                ...userToChallenge,
                user: toUserLight(userToChallenge.user),
            };
        });

        return {
            ...challenge,
            userToChallenge: userToChallengeWithLightUser,
        };
    }

    async update(id: number, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
        const challenge = await this.findOne(id);

        Object.assign(challenge, updateChallengeDto);

        return this.challengeRepository.save(challenge);
    }

    async remove(id: number): Promise<void> {
        const challenge = await this.findOne(id);
        await this.challengeRepository.remove(challenge);
    }

    async addUser(challengeId: number, addUserDto: AddUsersDto): Promise<any> {
        const challenge = await this.findOne(challengeId);
        const user = await this.userRepository.findOne({ where: { id: addUserDto.userId } });

        if (!user) {
            throw new NotFoundException(`User with ID ${addUserDto.userId} not found`);
        }

        if (!challenge) {
            throw new NotFoundException(`Challenge with ID ${addUserDto.userId} not found`);
        }

        const alreadyUser = challenge.userToChallenge.some((u) => u.user.id === user.id);

        if (alreadyUser) {
            throw new NotFoundException(`User ${addUserDto.userId} already started this challenge ${challenge.id}`);
        }

        const userToChallenge = this.userToChallengeRepository.create({
            challenge: challenge,
            user: user,
            status: ChallengeStatus.START,
        });

        const savedUserToChallenge = await this.userToChallengeRepository.save(userToChallenge);

        return {
            ...savedUserToChallenge,
            user: toUserLight(savedUserToChallenge.user),
        };
    }
}
