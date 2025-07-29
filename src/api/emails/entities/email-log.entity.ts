import { EmailTemplateType } from '@src/api/emails/entities/email-template.entity';
import { User } from '@src/api/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum EmailStatus {
    PENDING = 'pending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    FAILED = 'failed',
    BOUNCED = 'bounced',
    OPENED = 'opened',
    CLICKED = 'clicked',
}

@Entity('email_logs')
export class EmailLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    to: string;

    @Column({ nullable: true })
    from: string;

    @Column()
    subject: string;

    @Column('text')
    htmlContent: string;

    @Column('text', { nullable: true })
    textContent: string;

    @Column({
        type: 'enum',
        enum: EmailStatus,
        default: EmailStatus.PENDING,
    })
    status: EmailStatus;

    @Column({ nullable: true })
    errorMessage: string;

    @Column({ nullable: true })
    templateId: number;

    @Column({
        type: 'enum',
        enum: EmailTemplateType,
        nullable: true,
    })
    templateType: EmailTemplateType;

    @ManyToOne(() => User, { nullable: true })
    user: User;

    @Column('json', { nullable: true })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    sentAt: Date;

    @Column({ nullable: true })
    deliveredAt: Date;

    @Column({ nullable: true })
    openedAt: Date;

    @Column({ nullable: true })
    clickedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
