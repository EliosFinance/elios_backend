import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class SetupPinDto {
    @ApiProperty({
        description: 'PIN code to set up (digits only)',
        example: '123456',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain only digits only' })
    pin: string;

    @ApiPropertyOptional({
        description: 'Custom PIN length (default: 6)',
        example: 6,
    })
    @IsOptional()
    @IsNumber()
    pinLength?: number;

    @ApiPropertyOptional({
        description: 'Maximum failed attempts before locking (default: 3)',
        example: 3,
    })
    @IsOptional()
    @IsNumber()
    maxAttempts?: number;
}

export class VerifyPinDto {
    @ApiProperty({
        description: 'PIN code to verify pin (digits only)',
        example: '123456',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain only digits only' })
    pin: string;
}

export class ResetPinDto {
    @ApiProperty({
        description: 'Current PIN code (digits only)',
        example: '123456',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain only digits only' })
    currentPin: string;

    @ApiPropertyOptional({
        description: 'New PIN code to set (digits only)',
        example: '654321',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain digits only' })
    newPin: string;
}
