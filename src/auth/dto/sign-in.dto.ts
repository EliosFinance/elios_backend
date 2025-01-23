import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignInDto {
    @IsNotEmpty({ message: "The 'username' or 'email' field is required" })
    @IsString()
    usernameOrEmail: string;

    @IsNotEmpty({ message: "The 'password' field is required" })
    @IsString()
    password: string;
}
