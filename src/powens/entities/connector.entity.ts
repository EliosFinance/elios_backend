import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Connector {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    uuid: string;

    @Column()
    name: string;

    @Column()
    slug: string;

    @Column()
    color: string;

    @Column({ nullable: true })
    code: string;

    @Column('simple-array', { nullable: true })
    capabilities: string[];

    @Column('simple-array', { nullable: true })
    available_auth_mechanisms: string[];

    @Column('simple-array', { nullable: true })
    account_types: string[];

    @Column('simple-array', { nullable: true })
    products: string[];

    @Column('simple-array', { nullable: true })
    documents_types: string[];

    @Column({ default: false })
    restricted: boolean;

    @Column({ default: false })
    beta: boolean;

    @Column({ default: false })
    hidden: boolean;

    @UpdateDateColumn()
    last_updated: Date;
}
