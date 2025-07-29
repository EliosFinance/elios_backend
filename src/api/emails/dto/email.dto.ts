import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';

export class SendEmailDto {
    @ApiProperty({
        description: 'Recipient email address',
        example: 'user@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    to: string;

    @ApiPropertyOptional({
        description: 'Email subject',
        example: 'Welcome to Elios!',
    })
    @IsOptional()
    @IsString()
    subject?: string;

    @ApiPropertyOptional({
        description: 'Template type to use',
        enum: EmailTemplateType,
        example: EmailTemplateType.WELCOME,
    })
    @IsOptional()
    @IsEnum(EmailTemplateType)
    templateType?: EmailTemplateType;

    @ApiPropertyOptional({
        description: 'Specific template ID to use',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    templateId?: number;

    @ApiPropertyOptional({
        description: 'Custom HTML content',
        example: '<h1>Hello {{username}}!</h1>',
    })
    @IsOptional()
    @IsString()
    htmlContent?: string;

    @ApiPropertyOptional({
        description: 'Custom text content',
        example: 'Hello {{username}}!',
    })
    @IsOptional()
    @IsString()
    textContent?: string;

    @ApiPropertyOptional({
        description: 'Variables to replace in template',
        example: { username: 'John', verificationUrl: 'https://...' },
    })
    @IsOptional()
    @IsObject()
    variables?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Additional metadata',
        example: { campaign: 'welcome_series' },
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

export class CreateEmailTemplateDto {
    @ApiProperty({
        description: 'Template name',
        example: 'welcome_email',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Template type',
        enum: EmailTemplateType,
        example: EmailTemplateType.WELCOME,
    })
    @IsEnum(EmailTemplateType)
    type: EmailTemplateType;

    @ApiProperty({
        description: 'Email subject',
        example: 'Bienvenue chez Elios, {{username}}!',
    })
    @IsNotEmpty()
    @IsString()
    subject: string;

    @ApiProperty({
        description: 'HTML content with variables',
        example: '<h1>Bonjour {{username}}</h1><p>Bienvenue sur Elios!</p>',
    })
    @IsNotEmpty()
    @IsString()
    htmlContent: string;

    @ApiPropertyOptional({
        description: 'Text content with variables',
        example: 'Bonjour {{username}}, bienvenue sur Elios!',
    })
    @IsOptional()
    @IsString()
    textContent?: string;

    @ApiPropertyOptional({
        description: 'Available variables documentation',
        example: { username: 'string', verificationUrl: 'string' },
    })
    @IsOptional()
    @IsObject()
    variables?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Template description',
        example: 'Email de bienvenue envoyé après inscription',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'Is template active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {}

export class VerifyEmailDto {
    @ApiProperty({
        description: 'Email verification token',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsNotEmpty()
    @IsString()
    token: string;
}

export class Send2FADto {
    @ApiPropertyOptional({
        description: 'Purpose of 2FA code',
        example: 'login',
        enum: ['login', 'sensitive_action', 'account_recovery'],
    })
    @IsOptional()
    @IsString()
    purpose?: string;
}

export class Verify2FADto {
    @ApiProperty({
        description: '6-digit 2FA code',
        example: '123456',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{6}$/, { message: '2FA code must be 6 digits' })
    code: string;

    @ApiPropertyOptional({
        description: 'Purpose of 2FA code',
        example: 'login',
    })
    @IsOptional()
    @IsString()
    purpose?: string;
}

export class EmailStatsDto {
    @ApiPropertyOptional({
        description: 'Start date for stats',
        example: '2024-01-01',
    })
    @IsOptional()
    @IsString()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'End date for stats',
        example: '2024-01-31',
    })
    @IsOptional()
    @IsString()
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Template type filter',
        enum: EmailTemplateType,
    })
    @IsOptional()
    @IsEnum(EmailTemplateType)
    templateType?: EmailTemplateType;
}

export class BulkEmailDto {
    @ApiProperty({
        description: 'List of recipient emails',
        example: ['user1@example.com', 'user2@example.com'],
    })
    @IsNotEmpty()
    @IsEmail({}, { each: true })
    recipients: string[];

    @ApiProperty({
        description: 'Template type to use',
        enum: EmailTemplateType,
        example: EmailTemplateType.PREMIUM_UPGRADE,
    })
    @IsEnum(EmailTemplateType)
    templateType: EmailTemplateType;

    @ApiPropertyOptional({
        description: 'Common variables for all recipients',
        example: { campaignName: 'Black Friday Sale' },
    })
    @IsOptional()
    @IsObject()
    commonVariables?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Individual variables per recipient',
        example: [
            { email: 'user1@example.com', variables: { username: 'John' } },
            { email: 'user2@example.com', variables: { username: 'Jane' } },
        ],
    })
    @IsOptional()
    individualVariables?: Array<{
        email: string;
        variables: Record<string, any>;
    }>;
}

export class EmailPreviewDto {
    @ApiProperty({
        description: 'Template ID or type',
    })
    templateId?: number;

    @ApiPropertyOptional({
        description: 'Template type',
        enum: EmailTemplateType,
    })
    @IsOptional()
    @IsEnum(EmailTemplateType)
    templateType?: EmailTemplateType;

    @ApiPropertyOptional({
        description: 'Variables for preview',
        example: { username: 'John Doe', verificationUrl: 'https://example.com/verify' },
    })
    @IsOptional()
    @IsObject()
    variables?: Record<string, any>;
}
