import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { RewardType } from '../entities/reward.entity';

export class AddRewardsDto {
    @IsNotEmpty({ message: "The 'title' field is required" })
    @IsString()
    title: string;

    @IsNotEmpty({ message: "The 'description' field is required" })
    @IsString()
    description: string;

    @IsNotEmpty({ message: "The 'rewardType' field is required" })
    @IsEnum(RewardType, { message: "The 'rewardType' field must be a valid RewardType value" })
    rewardType: RewardType;

    @IsNotEmpty({ message: "The 'value' field is required" })
    @IsNumber()
    value: number;

    @IsOptional()
    @IsString({ message: "The 'icon' field is required" })
    icon: string;
}
