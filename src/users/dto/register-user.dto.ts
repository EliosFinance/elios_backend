import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
    @IsNotEmpty({ message: "The 'username' field is required" })
    @IsString()
    username: string;

    @IsNotEmpty({ message: "The 'password' field is required" })
    @IsString()
    password: string;

    @IsNotEmpty({ message: "The 'email' field is required" })
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    powens_token: string;
}
