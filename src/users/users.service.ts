import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
    async create(registerUserDto: RegisterUserDto): Promise<User> {
        const { username, password } = registerUserDto;

        // const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hashSync(password, 10);

        const user = new User();
        user.username = username;
        user.password = hashedPassword;

        return this.userRepository.save(user);
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

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
