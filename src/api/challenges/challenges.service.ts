import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CHALLENGE_WORKER_QUEUE_TOKEN } from '@src/types/ChallengeWorkerTypes';
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
        @Inject(CHALLENGE_WORKER_QUEUE_TOKEN)
        private challengeQueue: Queue,
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

    async startChallengeForUser(userId: number, challengeId: number): Promise<UserToChallenge> {
        const userChallenge = await this.userToChallengeRepository.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });

        if (userChallenge) throw new Error('User already has this challenge');

        const challenge = await this.challengeRepository.findOne({ where: { id: challengeId } });
        if (!challenge) throw new NotFoundException('Challenge not found');

        const machine = createMachine(challenge.stateMachineConfig);
        const actor = createActor(machine);
        actor.start();

        const newUserChallenge = this.userToChallengeRepository.create({
            user: { id: userId },
            challenge: { id: challengeId },
            currentState: String(actor.getSnapshot().value),
        });

        await this.userToChallengeRepository.save(newUserChallenge);

        await this.challengeQueue.add('process-challenge', { userId, challengeId });

        return newUserChallenge;
    }

    async updateUserChallenge(userId: number, challengeId: number) {
        const userChallenge = await this.userToChallengeRepository.findOne({
            where: { user: { id: userId }, challenge: { id: challengeId } },
        });

        if (!userChallenge) throw new Error('User challenge state not found');

        const challenge = await this.findFullOne(challengeId);

        const machine = createMachine(challenge.stateMachineConfig);
        const machineWithContext = createMachine({
            ...challenge.stateMachineConfig,
            context: { currentState: userChallenge.currentState },
        });
        const actor = createActor(machineWithContext);

        actor.start();

        const nextTransitions = machine.getTransitionData(actor.getSnapshot(), { type: 'NEXT' });

        if (!nextTransitions || nextTransitions.length === 0) {
            throw new Error(`No valid transition from state: ${userChallenge.currentState}`);
        }

        actor.send({ type: 'NEXT' });

        userChallenge.currentState = String(actor.getSnapshot().value);
        console.log(`User ${userId} transitioned challenge ${challengeId} to ${userChallenge.currentState}`);

        return await this.userToChallengeRepository.save(userChallenge);
    }
}
