import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserNotificationsDto {
    @IsOptional()
    @IsBoolean()
    accountSync?: boolean;

    @IsOptional()
    @IsBoolean()
    budget?: boolean;

    @IsOptional()
    @IsBoolean()
    expenses?: boolean;

    @IsOptional()
    @IsBoolean()
    learn?: boolean;

    @IsOptional()
    @IsBoolean()
    emails?: boolean;

    @IsOptional()
    @IsBoolean()
    push?: boolean;

    @IsOptional()
    @IsBoolean()
    friends?: boolean;

    @IsOptional()
    @IsBoolean()
    challenges?: boolean;

    @IsOptional()
    @IsBoolean()
    weeklyReport?: boolean;

    @IsOptional()
    @IsBoolean()
    monthlyReport?: boolean;
}
