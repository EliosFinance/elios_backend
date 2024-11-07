import { IsEnum } from 'class-validator';
import { CategoryChallenge } from '../entities/challenge.entity';

export class CreateChallengeDto {
    title: string;
    description: string;
    image: string;
    enterpriseId: number;
    @IsEnum(CategoryChallenge)
    category: CategoryChallenge;
}
