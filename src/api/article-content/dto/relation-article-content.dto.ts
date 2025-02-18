import { IsInt, IsNotEmpty } from 'class-validator';

export class readUser {
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}

export class saveUser {
    @IsNotEmpty({ message: "The 'userId' field is required" })
    @IsInt({ message: "The 'userId' must be a user id number" })
    userId: number;
}
