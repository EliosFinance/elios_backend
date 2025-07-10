import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from '@src/api/emails/dto/email.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EmailService } from '../services/email.service';

@ApiTags('Email Templates')
@Controller('email-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class EmailTemplatesController {
    constructor(private readonly emailService: EmailService) {}

    @Post()
    @ApiOperation({ summary: 'Create email template' })
    @ApiResponse({ status: 201, description: 'Template created successfully' })
    async createTemplate(@Body() createTemplateDto: CreateEmailTemplateDto) {
        return this.emailService.createTemplate(createTemplateDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all email templates' })
    async getAllTemplates() {
        return this.emailService.getAllTemplates();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get email template by ID' })
    async getTemplate(@Param('id') id: number) {
        return this.emailService.getTemplate(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update email template' })
    async updateTemplate(@Param('id') id: number, @Body() updateTemplateDto: UpdateEmailTemplateDto) {
        return this.emailService.updateTemplate(id, updateTemplateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete email template' })
    async deleteTemplate(@Param('id') id: number) {
        await this.emailService.deleteTemplate(id);
        return { message: 'Template deleted successfully' };
    }
}
