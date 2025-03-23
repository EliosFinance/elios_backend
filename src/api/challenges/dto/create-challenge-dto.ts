import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CategoryChallenge } from '../entities/challenge.entity';

export class CreateChallengeDto {
    @IsNotEmpty({ message: 'The title field is required' })
    @IsString()
    title: string;

    @IsNotEmpty({ message: 'The description is required' })
    @IsString()
    description: string;

    @IsNotEmpty({ message: 'The image is required' })
    @IsString()
    image: string;

    @IsNotEmpty({ message: 'The enterpriseId is required' })
    @IsNumber()
    enterpriseId: number;

    @IsEnum(CategoryChallenge)
    category: CategoryChallenge;

    @IsNotEmpty({ message: 'The config field is required' })
    config: CategoryChallenge;
}
