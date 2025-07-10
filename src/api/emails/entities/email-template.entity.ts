import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum EmailTemplateType {
    WELCOME = 'welcome',
    EMAIL_VERIFICATION = 'email_verification',
    TWO_FACTOR_AUTH = '2fa',
    PASSWORD_RESET = 'password_reset',
    PREMIUM_UPGRADE = 'premium_upgrade',
    PREMIUM_WELCOME = 'premium_welcome',
    ACCOUNT_ACTIVATED = 'account_activated',
    WEEKLY_DIGEST = 'weekly_digest',
    MONTHLY_DIGEST = 'monthly_digest',
    CHALLENGE_COMPLETED = 'challenge_completed',
    CUSTOM = 'custom',
}

@Entity('email_templates')
export class EmailTemplate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({
        type: 'enum',
        enum: EmailTemplateType,
        default: EmailTemplateType.CUSTOM,
    })
    type: EmailTemplateType;

    @Column()
    subject: string;

    @Column('text')
    htmlContent: string;

    @Column('text', { nullable: true })
    textContent: string;

    @Column('json', { nullable: true })
    variables: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
