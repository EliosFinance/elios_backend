import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class SetupPinDto {
    @ApiProperty({
        description: 'PIN code to set up (digits only)',
        example: '123456',
    })
    @IsNotEmpty({ message: "The 'pin' field is required" })
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain only digits' })
    pin: string;
}

export class VerifyPinDto {
    @ApiProperty({
        description: 'PIN code to verify (digits only)',
        example: '123456',
    })
    @IsNotEmpty({ message: "The 'pin' field is required" })
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain only digits' })
    pin: string;
}

export class ResetPinDto {
    @ApiProperty({
        description: 'Current PIN code (digits only)',
        example: '123456',
    })
    @IsNotEmpty({ message: "The 'currentPin' field is required" })
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain only digits' })
    currentPin: string;

    @ApiPropertyOptional({
        description: 'New PIN code to set (digits only)',
        example: '654321',
    })
    @IsNotEmpty({ message: "The 'newPin' field is required" })
    @IsString()
    @Matches(/^\d+$/, { message: 'PIN must contain digits only' })
    newPin: string;
}

export class AppStatusDto {
    @ApiProperty({
        description: 'Device ID for tracking app session',
        example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    })
    @IsNotEmpty({ message: "The 'deviceId' field is required" })
    @IsString()
    deviceId: string;
}
