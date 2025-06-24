import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserCompletionStatusDto {
    @ApiProperty()
    emailVerified: boolean;

    @ApiProperty()
    pinConfigured: boolean;

    @ApiProperty()
    termsAccepted: boolean;

    @ApiProperty()
    profileComplete: boolean;

    @ApiProperty()
    provider: 'email' | 'google';

    @ApiProperty()
    registrationDate: Date;

    @ApiProperty({ type: [String] })
    nextSteps: string[];
}

export class AcceptTermsDto {
    @ApiProperty({
        description: 'User ID',
        example: 123,
    })
    @IsNotEmpty()
    userId: number;
}

export class VerifyEmailGoogleDto {
    @ApiProperty({
        description: 'Email address to verify',
        example: 'user@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class UpdateProfileDto {
    @ApiPropertyOptional({
        description: 'Username',
        example: 'john_doe',
    })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({
        description: 'Email address',
        example: 'john@example.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Mark profile as complete',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    profileComplete?: boolean;
}
