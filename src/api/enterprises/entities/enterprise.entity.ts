import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Challenge } from '../../challenges/entities/challenge.entity';

@Entity()
export class Enterprise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 64 })
    // Obligatoire
    name: string;

    @Column('text')
    // Obligatoire
    description: string;

    @OneToMany(
        () => Challenge,
        (challenge) => challenge.enterprise,
    )
    challenge: Challenge[];

    // Logo
    @CreateDateColumn()
    creation_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}
