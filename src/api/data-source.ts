import 'dotenv/config';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
    type: 'postgres',
    host: String(process.env.POSTGRES_HOST),
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: String(process.env.POSTGRES_USER),
    password: String(process.env.POSTGRES_PASSWORD),
    database: String(process.env.POSTGRES_DB),
    entities: ['**/entity/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: true,
    logging: true,
});

export default dataSource;
