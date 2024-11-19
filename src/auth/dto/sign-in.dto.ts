import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
    @IsNotEmpty({ message: "The 'username' field is required" })
    @IsString()
    username: string;

    @IsNotEmpty({ message: "The 'password' field is required" })
    @IsString()
    password: string;
}
