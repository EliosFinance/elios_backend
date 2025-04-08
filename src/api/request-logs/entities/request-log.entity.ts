import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RequestLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    method: string;

    @Column({ type: 'text' })
    url: string;

    @Column()
    ip: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    statusCode: number;

    @Column({ type: 'int', nullable: true })
    responseTime: number;

    @ManyToOne(() => User, { nullable: true })
    user: User;

    @Column({ nullable: true })
    userId: number;

    @Column({ type: 'json', nullable: true })
    requestBody: any;

    @Column({ type: 'json', nullable: true })
    requestQuery: any;

    @Column({ type: 'json', nullable: true })
    requestHeaders: any;

    @CreateDateColumn()
    timestamp: Date;
}
