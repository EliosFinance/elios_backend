import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../api/users/entities/user.entity';
import { Friends } from './entities/friends.entity';

@Injectable()
export class FriendsService {
    constructor(
        @InjectRepository(Friends)
        private friendsRepo: Repository<Friends>,

        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

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

    async getFriends(userId: number) {
        const relations = await this.friendsRepo.find({
            where: [
                { fromUser: { id: userId }, status: 'ACCEPTED' },
                { toUser: { id: userId }, status: 'ACCEPTED' },
            ],
        });

        return relations.map((rel) => (rel.fromUser.id === userId ? rel.toUser : rel.fromUser));
    }
}
