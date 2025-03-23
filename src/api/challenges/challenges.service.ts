import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createActor, createMachine } from 'xstate';
import { Enterprise } from '../enterprises/entities/enterprise.entity';
import { User } from '../users/entities/user.entity';
import { CreateChallengeDto } from './dto/create-challenge-dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { Challenge } from './entities/challenge.entity';
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

    async findAll(): Promise<Challenge[]> {
        return this.challengeRepository.find({ relations: ['enterprise', 'userToChallenge', 'userToChallenge.user'] });
    }

    async findOne(id: number): Promise<Challenge> {
        const challenge = await this.challengeRepository.findOne({
            where: { id: id },
            relations: ['enterprise', 'userToChallenge', 'userToChallenge.user'],
        });

        if (!challenge) {
            throw new NotFoundException(`The challenge with ID ${id} not found`);
        }

        return challenge;
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

    async startChallengeForUser(userId: number, challengeId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const challenge = await this.findOne(challengeId);

        if (!user || !challenge) throw new Error('User or Challenge not found');

        const userChallenge = await this.userToChallengeRepository.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });

        if (userChallenge) {
            throw new Error('User already has this challenge');
        }

        const machineConfig = {
            id: `challenge-${challengeId}-user-${userId}`,
            initial: 'not_started',
            states: {
                not_started: { on: { START: 'in_progress' } },
                in_progress: { on: { COMPLETE: 'completed', FAIL: 'failed' } },
                completed: { type: 'final' },
                failed: { type: 'final' },
            },
        };

        const newUserChallenge = this.userToChallengeRepository.create({
            user,
            challenge,
            stateMachineConfig: machineConfig,
            currentState: machineConfig.initial,
        });

        return await this.userToChallengeRepository.save(newUserChallenge);
    }

    async updateUserChallenge(userId: number, challengeId: number, event: string) {
        const userChallenge = await this.userToChallengeRepository.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });

        if (!userChallenge) throw new Error('User challenge state not found');

        const machine = createMachine(userChallenge.stateMachineConfig);
        const actor = createActor(machine);

        actor.start();
        actor.send({ type: event });

        userChallenge.currentState = String(actor.getSnapshot().value);
        return await this.userToChallengeRepository.save(userChallenge);
    }
}
