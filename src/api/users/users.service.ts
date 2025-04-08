import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
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
        const { username, email, password } = registerUserDto;

        // const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hashSync(password, 10);

        const payload = {
            client_id: '70395459',
            client_secret: 'j7IX1ETJ4zyRUt8XucEaSSsuEz/oYhCK',
        };

        try {
            const response = await axios.post('https://lperrenot-sandbox.biapi.pro/2.0/auth/init', payload);
            console.log(response);
            const { auth_token, id_user } = response.data;
            const user = new User();
            user.username = username;
            user.password = hashedPassword;
            user.email = email;
            user.powens_token = auth_token;
            user.powens_id = id_user;

            try {
                const savedUser = await this.userRepository.save(user);
                console.log('je passe la');
                const notifications = new UserNotifications();
                notifications.user = savedUser;
                await this.notificationsRepository.save(notifications);

                return savedUser;
            } catch (error) {
                const errorMessage = error?.detail || error?.message || '';

                const isUsernameTaken = /(username)[\s\S]+(already exists)/.test(errorMessage);
                const isEmailTaken = /(email)[\s\S]+(already exists)/.test(errorMessage);

                if (isUsernameTaken && isEmailTaken) {
                    throw new BadRequestException('The username and email are already taken');
                }

                if (isUsernameTaken) {
                    throw new BadRequestException('The username is already taken');
                }

                if (isEmailTaken) {
                    throw new BadRequestException('The email is already in use');
                }

                throw new Error(errorMessage || 'An unknown error occurred.');
            }
        } catch (error) {
            console.error('Error during Powens API call: ', error);
            throw new Error('Failed to initialize Powens auth token');
        }
    }

    findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: ['transactions', 'friends', 'notifications'],
        });
    }

    findOne(id: number): Promise<User> {
        return this.userRepository.findOne({
            where: { id },
            relations: ['transactions', 'friends', 'notifications'],
        });
    }

    findOneByUsername(usernameOrEmail: string): Promise<User> {
        return this.userRepository.findOne({
            where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
    }

    findOneByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
    }

    async updateUser(id: number, updateField: Partial<User>): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new Error('User not found');
        }
        Object.assign(user, updateField);
        return this.userRepository.save(user);
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
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
}
