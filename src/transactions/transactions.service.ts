import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";


@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
  ) {}

  async getUserTransactions(userId: number, order: 'ASC' | 'DESC' = 'DESC'): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { user: { id: userId } },
      order: {
        date: order,
      },
    });
  }

  async saveTransactions(transactions: any[], userId: number): Promise<void> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new Error("No user with this id");
    }

    const transactionEntities = transactions.map((tx) => {
      const transaction = this.transactionsRepository.create(tx);
      // @ts-ignore
      transaction.user = user;
      return transaction;
    });
    const flattenedTransactionEntities = transactionEntities.flat();
    const transactionSave = await this.transactionsRepository.save(
      flattenedTransactionEntities,
    );
  }
}
