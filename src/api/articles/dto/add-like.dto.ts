import { IsInt, IsNotEmpty } from 'class-validator';

export class AddLikeDto {
    userId: number;
}

export class readUserArticle {
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}

export class saveUserArticle {
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}
