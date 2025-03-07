import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserNotificationsDto } from './dto/update-user-notifications.dto';
import { UserNotifications } from './entities/user-notifications.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(UserNotifications) private readonly notificationsRepository: Repository<UserNotifications>,
    ) {}

    async create(registerUserDto: RegisterUserDto): Promise<User> {
        const { username, password } = registerUserDto;
        const hashedPassword = await bcrypt.hashSync(password, 10);

        const user = new User();
        user.username = username;
        user.password = hashedPassword;

        const savedUser = await this.userRepository.save(user);

        const notifications = new UserNotifications();
        notifications.user = savedUser;
        await this.notificationsRepository.save(notifications);

        return savedUser;
    }

    findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: ['transactions', 'friends', 'notifications'],
        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['transactions', 'friends', 'notifications'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const result = await this.userRepository.query(
            `
            SELECT * 
            FROM "user"
            LEFT JOIN "user_notifications" ON "user_notifications"."userId" = "user"."id"
            WHERE "user"."id" = $1
        `,
            [id],
        );

        console.log('Résultat brut :', result);

        return user;
    }

    findOneByUsername(username: string): Promise<User> {
        return this.userRepository.findOneBy({ username });
    }

    async updateUser(id: number, updateField: Partial<User>): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, updateField);
        return this.userRepository.save(user);
    }

    async updateUserNotifications(id: number, updateUserNotificationsDto: UpdateUserNotificationsDto) {
        const user = await this.findOne(id);
        if (!user) throw new NotFoundException('User not found');

        if (!user.notifications) {
            user.notifications = this.notificationsRepository.create();
            user.notifications.user = user;
            await this.notificationsRepository.save(user.notifications);
        }

        Object.assign(user.notifications, updateUserNotificationsDto);
        await this.notificationsRepository.save(user.notifications);
        return user.notifications;
    }

    async triggerNotification(id: number, type: string) {
        const user = await this.findOne(id);
        if (!user) throw new NotFoundException('User not found');

        return { message: `Notification '${type}' envoyée à ${user.username}` };
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
