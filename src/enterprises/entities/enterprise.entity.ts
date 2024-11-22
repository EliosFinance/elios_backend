import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

    @CreateDateColumn()
    creation_date: Date;

    @OneToMany(
        () => Challenge,
        (challenge) => challenge.enterprise,
    )
    challenge: Challenge[];

    // Logo
}
