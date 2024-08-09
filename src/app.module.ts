import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PowensModule } from './powens/powens.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserModule } from "./user/user.module";
import { TransactionsModule } from './transactions/transactions.module';
import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5444,
      username: String(process.env.POSTGRES_USER),
      password: String(process.env.POSTGRES_PASSWORD),
      database: String(process.env.POSTGRES_DB),
      entities: ['**/entity/*.entity.ts'],
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
    }),
    PowensModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
