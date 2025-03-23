import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
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
            const { auth_token, id_user } = response.data;
            const user = new User();
            user.username = username;
            user.password = hashedPassword;
            user.email = email;
            user.powens_token = auth_token;
            user.powens_id = id_user;

            return this.userRepository.save(user).catch((error) => {
                const errorMessage = error.detail;
                if (
                    /(username)[\s\S]+(already exists)/.test(errorMessage) &&
                    /(email)[\s\S]+(already exists)/.test(errorMessage)
                ) {
                    throw new BadRequestException('The username and email are already taken');
                }
                if (/(username)[\s\S]+(already exists)/.test(errorMessage)) {
                    throw new BadRequestException('The username is already taken');
                }
                if (/(email)[\s\S]+(already exists)/.test(errorMessage)) {
                    throw new BadRequestException('The email is already in use');
                }

                throw new Error(error.message) || 'An unknown error occurred.';
            });
        } catch (error: any) {
            console.error('Error during Powens API call: ', error);
            throw new Error('Failed to initialize Powens auth token');
        }
    }

    findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: ['transactions', 'friends'],
        });
    }

    findOne(id: number): Promise<User> {
        return this.userRepository.findOne({
            where: { id },
            relations: ['transactions', 'friends'],
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
}
