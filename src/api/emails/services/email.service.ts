import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailLog } from '@src/api/emails/entities/email-log.entity';
import { EmailStatus } from '@src/api/emails/entities/email-log.entity';
import { EmailTemplate, EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import { User } from '@src/api/users/entities/user.entity';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';

export interface SendEmailOptions {
    to: string;
    subject?: string;
    templateType?: EmailTemplateType;
    templateId?: number;
    htmlContent?: string;
    textContent?: string;
    variables?: Record<string, any>;
    userId?: number;
    metadata?: Record<string, any>;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor(
        @InjectRepository(EmailTemplate)
        private readonly emailTemplateRepository: Repository<EmailTemplate>,
        @InjectRepository(EmailLog)
        private readonly emailLogRepository: Repository<EmailLog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        if (process.env.NODE_ENV === 'development') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'localhost',
                port: parseInt(process.env.SMTP_PORT || '1026'),
                secure: false,
                auth: false,
                tls: {
                    rejectUnauthorized: false,
                },
            } as any);
        } else {
            // Configuration spécifique pour AWS SES
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false, // false pour port 587 (STARTTLS)
                requireTLS: true, // Force l'utilisation de STARTTLS
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
                tls: {
                    // Ne pas rejeter les certificats non autorisés en dev
                    rejectUnauthorized: process.env.NODE_ENV === 'production',
                },
            });
        }

        this.logger.log('Email transporter initialized');
    }

    async sendEmail(options: SendEmailOptions): Promise<EmailLog> {
        try {
            let emailLog: EmailLog;

            if (options.templateType || options.templateId) {
                emailLog = await this.sendFromTemplate(options);
            } else if (options.htmlContent || options.textContent) {
                emailLog = await this.sendDirectEmail(options);
            } else {
                throw new Error('Either template or content must be provided');
            }

            return emailLog;
        } catch (error) {
            this.logger.error(`Failed to send email: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async sendFromTemplate(options: SendEmailOptions): Promise<EmailLog> {
        let template: EmailTemplate;

        if (options.templateId) {
            template = await this.emailTemplateRepository.findOne({
                where: { id: options.templateId, isActive: true },
            });
        } else if (options.templateType) {
            template = await this.emailTemplateRepository.findOne({
                where: { type: options.templateType, isActive: true },
            });
        }

        if (!template) {
            throw new NotFoundException('Email template not found or inactive');
        }

        const processedContent = this.processTemplate(template, options.variables || {});

        return this.sendDirectEmail({
            ...options,
            subject: options.subject || processedContent.subject,
            htmlContent: processedContent.htmlContent,
            textContent: processedContent.textContent,
            templateId: template.id,
            templateType: template.type,
        });
    }

    private async sendDirectEmail(options: SendEmailOptions): Promise<EmailLog> {
        const user = options.userId
            ? await this.userRepository.findOne({
                  where: { id: options.userId },
              })
            : null;

        const emailLog = this.emailLogRepository.create({
            to: options.to,
            from: process.env.EMAIL_FROM || 'noreply@elios.com',
            subject: options.subject || 'No subject',
            htmlContent: options.htmlContent || '',
            textContent: options.textContent || '',
            templateId: options.templateId,
            templateType: options.templateType,
            user,
            metadata: options.metadata,
            status: EmailStatus.PENDING,
        });

        const savedLog = await this.emailLogRepository.save(emailLog);

        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@elios.com',
                to: options.to,
                subject: options.subject,
                html: options.htmlContent,
                text: options.textContent,
            };

            const result = await this.transporter.sendMail(mailOptions);

            savedLog.status = EmailStatus.SENT;
            savedLog.sentAt = new Date();
            await this.emailLogRepository.save(savedLog);

            this.logger.log(`Email sent successfully to ${options.to}`);
            return savedLog;
        } catch (error) {
            savedLog.status = EmailStatus.FAILED;
            savedLog.errorMessage = error.message;
            await this.emailLogRepository.save(savedLog);

            this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
            throw error;
        }
    }

    private processTemplate(template: EmailTemplate, variables: Record<string, any>) {
        let htmlContent = template.htmlContent;
        let textContent = template.textContent || '';
        let subject = template.subject;

        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
            textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
            subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
        });

        return { htmlContent, textContent, subject };
    }

    async createTemplate(templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const template = this.emailTemplateRepository.create(templateData);
        return this.emailTemplateRepository.save(template);
    }

    async updateTemplate(id: number, templateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
        await this.emailTemplateRepository.update(id, templateData);
        const updated = await this.emailTemplateRepository.findOne({ where: { id } });
        if (!updated) {
            throw new NotFoundException('Template not found');
        }
        return updated;
    }

    async getTemplate(id: number): Promise<EmailTemplate> {
        const template = await this.emailTemplateRepository.findOne({ where: { id } });
        if (!template) {
            throw new NotFoundException('Template not found');
        }
        return template;
    }

    async getTemplateByType(type: EmailTemplateType): Promise<EmailTemplate> {
        const template = await this.emailTemplateRepository.findOne({
            where: { type, isActive: true },
        });
        if (!template) {
            throw new NotFoundException(`Template of type ${type} not found`);
        }
        return template;
    }

    async getAllTemplates(): Promise<EmailTemplate[]> {
        return this.emailTemplateRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async deleteTemplate(id: number): Promise<void> {
        const result = await this.emailTemplateRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Template not found');
        }
    }

    async getEmailLogs(userId?: number, limit: number = 50): Promise<EmailLog[]> {
        const queryBuilder = this.emailLogRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .orderBy('log.createdAt', 'DESC')
            .limit(limit);

        if (userId) {
            queryBuilder.where('log.user.id = :userId', { userId });
        }

        return queryBuilder.getMany();
    }

    async markEmailAsOpened(emailId: number): Promise<void> {
        await this.emailLogRepository.update(emailId, {
            status: EmailStatus.OPENED,
            openedAt: new Date(),
        });
    }

    async markEmailAsClicked(emailId: number): Promise<void> {
        await this.emailLogRepository.update(emailId, {
            status: EmailStatus.CLICKED,
            clickedAt: new Date(),
        });
    }
}
