import { DataSource } from 'typeorm';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'elios_user',
    password: process.env.POSTGRES_PASSWORD || 'elios_secure_password_2024',
    database: process.env.POSTGRES_DB || 'elios_db',
    entities: ['src/**/entity/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
});
