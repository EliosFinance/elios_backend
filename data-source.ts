import 'dotenv/config';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5444,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities:
        process.env.NODE_ENV === 'development'
            ? ['src/**/*.entity.ts'] // Pour `start:dev`
            : ['dist/**/*.entity.js'], // Pour `start`
    migrations: ['src/migrations/*.ts'],
    synchronize: true,
    logging: true,
});

export default dataSource;
