import { IsAlphanumeric, IsEmail, IsEnum, IsInt, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class CreateUserDto {
    @IsString()
    @MinLength(2, { message: 'Name must have at least 2 characters' })
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @MinLength(3, { message: 'Username must have at least 3 characters' })
    @IsAlphanumeric(null, { message: 'Username must be alphanumeric' })
    username: string;

    @IsNotEmpty()
    @IsEmail(null, { message: 'Invalid email' })
    email: string;

    @IsInt()
    age: number;

    @IsString()
    @IsEnum(['m', 'f', 'u'])
    gender: string;

    @IsNotEmpty()
    @Matches(passwordRegEx, {
        message:
            'Password must be at least 8 characters, and contain at least one uppercase letter, one lowercase letter, one number and one special character',
    })
    password: string;
}
