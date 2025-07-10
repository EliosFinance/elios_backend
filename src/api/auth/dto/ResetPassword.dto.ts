import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: "Le champ 'token' est requis" })
    @IsString({ message: "Le champ 'token' doit être une chaîne de caractères" })
    token: string;

    @IsNotEmpty({ message: "Le champ 'newPassword' est requis" })
    @IsString({ message: "Le champ 'newPassword' doit être une chaîne de caractères" })
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
        message: 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre.',
    })
    newPassword: string;
}
