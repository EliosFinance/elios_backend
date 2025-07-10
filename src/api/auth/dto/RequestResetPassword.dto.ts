import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestResetPasswordDto {
    @IsNotEmpty({ message: "Le champ 'email' est requis" })
    @IsEmail({}, { message: "Le champ 'email' doit être un email valide" })
    email: string;
}
