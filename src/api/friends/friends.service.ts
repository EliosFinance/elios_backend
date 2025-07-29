import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserToChallenge } from '@src/api/challenges/entities/usertochallenge.entity';
import { QuizzFinisher } from '@src/api/quizz/entities/quizz-finisher';
import { Repository } from 'typeorm';
import { In } from 'typeorm';
import { User } from '../../api/users/entities/user.entity';
import { Friend } from './entities/friend.entity';

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(Friend)
        private friendsRepo: Repository<Friend>,

        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(QuizzFinisher)
        private readonly quizzFinisherRepository: Repository<QuizzFinisher>,

        @InjectRepository(UserToChallenge)
        private readonly userToChallengeRepository: Repository<UserToChallenge>,
    ) {}

    async searchUsers(query: string, currentUserId: number) {
        const allFriends = await this.friendsRepo.find({
            where: [{ fromUser: { id: currentUserId } }, { toUser: { id: currentUserId } }],
            relations: ['fromUser', 'toUser'],
        });

        const excludedIds = new Set<number>([currentUserId]);

        for (const relation of allFriends) {
            if (relation.fromUser.id !== currentUserId) {
                excludedIds.add(relation.fromUser.id);
            }
            if (relation.toUser.id !== currentUserId) {
                excludedIds.add(relation.toUser.id);
            }
        }

        const results = await this.userRepo
            .createQueryBuilder('user')
            .where('user.id NOT IN (:...excludedIds)', { excludedIds: Array.from(excludedIds) })
            .andWhere('(LOWER(user.username) LIKE :query OR LOWER(user.email) LIKE :query)', {
                query: `%${query.toLowerCase()}%`,
            })
            .getMany();

        return results;
    }

    async addFriendRequest(fromUserId: number, toUserId: number) {
        if (fromUserId === toUserId) {
            throw new BadRequestException('Tu ne peux pas t’ajouter toi-même');
        }

        const fromUser = await this.userRepo.findOne({ where: { id: fromUserId } });
        const toUser = await this.userRepo.findOne({ where: { id: toUserId } });

        if (!toUser) throw new NotFoundException("L'utilisateur cible n'existe pas.");

        const existing = await this.friendsRepo.findOne({
            where: [
                { fromUser: { id: fromUserId }, toUser: { id: toUserId } },
                { fromUser: { id: toUserId }, toUser: { id: fromUserId } },
            ],
        });

        if (existing) throw new BadRequestException('Relation déjà existante.');

        const newRequest = this.friendsRepo.create({ fromUser, toUser, status: 'PENDING' });
        return this.friendsRepo.save(newRequest);
    }

    async acceptFriendRequest(currentUserId: number, requesterId: number) {
        const request = await this.friendsRepo.findOne({
            where: {
                fromUser: { id: requesterId },
                toUser: { id: currentUserId },
                status: 'PENDING',
            },
        });

        if (!request) throw new NotFoundException('Demande introuvable.');
        request.status = 'ACCEPTED';
        return this.friendsRepo.save(request);
    }

    async rejectFriendRequest(currentUserId: number, requesterId: number) {
        const request = await this.friendsRepo.findOne({
            where: {
                fromUser: { id: requesterId },
                toUser: { id: currentUserId },
                status: 'PENDING',
            },
        });

        if (!request) throw new NotFoundException('Demande introuvable.');
        request.status = 'REJECTED';
        return this.friendsRepo.save(request);
    }

    async getFriendsWithScores(userId: number) {
        const relations = await this.friendsRepo.find({
            where: [
                { fromUser: { id: userId }, status: 'ACCEPTED' },
                { toUser: { id: userId }, status: 'ACCEPTED' },
            ],
            relations: ['fromUser', 'toUser'],
        });

        const friends = relations.map((rel) => (rel.fromUser.id === userId ? rel.toUser : rel.fromUser));
        const friendIds = friends.map((f) => f.id);

        const allQuizResults = await this.quizzFinisherRepository.find({
            where: { user: { id: In(friendIds) } },
            relations: ['quizz'],
        });

        const finishedStates = ['REWARD_TO_CLAIM', 'REWARD_CLAIMED', 'END'];
        const allFinishedUTC = await this.userToChallengeRepository.find({
            where: {
                user: { id: In(friendIds) },
                currentState: In(finishedStates),
            },
            relations: ['challenge'],
        });

        return friends.map((friend) => {
            const quizzes = allQuizResults.filter((qr) => qr.user.id === friend.id);
            const challenges = allFinishedUTC.filter((utc) => utc.user.id === friend.id);

            const totalScore = quizzes.reduce((sum, q) => sum + (q.lastScore ?? 0), 0);

            return {
                id: friend.id,
                username: friend.username,
                score: totalScore,
                quizzes: quizzes.map((q) => ({
                    id: q.quizz.id,
                    title: q.quizz.title,
                    score: q.lastScore,
                })),
                challengesCompleted: challenges.map((c) => ({
                    id: c.challenge.id,
                    title: c.challenge.title,
                    state: c.currentState,
                })),
            };
        });
    }

    async getReceivedFriendRequests(userId: number) {
        const requests = await this.friendsRepo.find({
            where: {
                toUser: { id: userId },
                status: 'PENDING',
            },
            relations: ['fromUser'],
        });

        return requests.map((r) => r.fromUser);
    }

    async getSentFriendRequests(userId: number) {
        const requests = await this.friendsRepo.find({
            where: {
                fromUser: { id: userId },
                status: 'PENDING',
            },
            relations: ['toUser'],
        });

        return requests.map((r) => r.toUser);
    }

    async addFriendByReferralCode(currentUserId: number, referralCode: string) {
        const currentUser = await this.userRepo.findOneBy({ id: currentUserId });
        const parrain = await this.userRepo.findOneBy({ referralCode });

        if (!currentUser || !parrain) {
            throw new NotFoundException('Code invalide ou utilisateur introuvable');
        }

        if (currentUser.id === parrain.id) {
            throw new BadRequestException('Vous ne pouvez pas vous parrainer vous-même');
        }

        const existingRelation = await this.friendsRepo.findOne({
            where: [
                { fromUser: { id: currentUser.id }, toUser: { id: parrain.id } },
                { fromUser: { id: parrain.id }, toUser: { id: currentUser.id } },
            ],
        });

        if (existingRelation) {
            throw new BadRequestException('Vous êtes déjà amis');
        }

        await this.friendsRepo.save({
            fromUser: { id: currentUser.id },
            toUser: { id: parrain.id },
            status: 'ACCEPTED',
            isParrainage: true,
        });

        return { message: 'Ami ajouté via code parrainage' };
    }
}
