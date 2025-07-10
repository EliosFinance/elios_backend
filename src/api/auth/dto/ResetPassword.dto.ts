import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: "Le champ 'token' est requis" })
    @IsString({ message: "Le champ 'token' doit être une chaîne de caractères" })
    token: string;

    @IsNotEmpty({ message: "Le champ 'newPassword' est requis" })
    @IsString({ message: "Le champ 'newPassword' doit être une chaîne de caractères" })
    newPassword: string;
}
