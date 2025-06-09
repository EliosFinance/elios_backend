import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { toUserLight } from '../users/dto/user.utils';
import { UsersService } from '../users/users.service';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        private readonly usersService: UsersService,
        private readonly httpService: HttpService,
    ) {}

    async syncTransactions(userId: number, powensToken: string) {
        const apiUrl = `${process.env.POWENS_CLIENT_URL}users/me/transactions?limit=1000`;

        let response = await lastValueFrom(
            this.httpService.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${powensToken}`,
                },
            }),
        );

        let transactions = response.data.transactions;
        await this.saveTransactions(transactions, userId);

        while (response.data._links.next) {
            response = await lastValueFrom(
                this.httpService.get(response.data._links.next, {
                    headers: {
                        Authorization: `Bearer ${powensToken}`,
                    },
                }),
            );
            transactions = response.data.transactions;
            await this.saveTransactions(transactions, userId);
        }

        return this.getUserTransactions(userId);
    }

    async getUserTransactions(userId: number, order: 'ASC' | 'DESC' = 'DESC'): Promise<Transaction[]> {
        const transactions = await this.transactionsRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
            order: {
                date: order,
            },
        });

        return transactions.map((transaction) => {
            const serializedTransaction = {
                ...transaction,
                user: toUserLight(transaction.user),
            };

            return serializedTransaction as Transaction;
        });
    }

    async saveTransactions(transactions: any[], userId: number): Promise<void> {
        const user = await this.usersService.findOne(userId);

        if (!user) {
            throw new Error('No user with this id');
        }

        const userLight = toUserLight(user);

        for (const tx of transactions) {
            const existingTransaction = await this.transactionsRepository.findOneBy({
                powens_id: tx.id,
            });

            if (existingTransaction) {
                const hasChanged = this.hasTransactionsChanged(existingTransaction, tx);
                if (hasChanged) {
                    await this.transactionsRepository.save({
                        ...existingTransaction,
                        ...this.mapTransactionsToEntity(tx),
                    });
                }
            } else {
                const newTransaction = this.transactionsRepository.create({
                    ...this.mapTransactionsToEntity(tx),
                    user: userLight,
                });
                await this.transactionsRepository.save(newTransaction);
            }
        }
    }

    private hasTransactionsChanged(existingTransaction: Transaction, newTransaction: any): boolean {
        return (
            existingTransaction.id_account !== newTransaction.id_account ||
            existingTransaction.date !== newTransaction.date ||
            existingTransaction.value !== newTransaction.value ||
            existingTransaction.gross_value !== newTransaction.gross_value ||
            existingTransaction.type !== newTransaction.type ||
            existingTransaction.original_wording !== newTransaction.original_wording ||
            existingTransaction.simplified_wording !== newTransaction.simplified_wording ||
            existingTransaction.wording !== newTransaction.wording ||
            JSON.stringify(existingTransaction.categories) !== JSON.stringify(newTransaction.categories) ||
            existingTransaction.date_scraped !== newTransaction.date_scraped
        );
    }

    private mapTransactionsToEntity(tx: any): Partial<Transaction> {
        return {
            powens_id: tx.id,
            id_account: tx.id_account,
            date: tx.date,
            value: tx.value,
            gross_value: tx.gross_value,
            type: tx.type,
            original_wording: tx.original_wording,
            simplified_wording: tx.simplified_wording,
            wording: tx.wording,
            categories: tx.categories,
            date_scraped: tx.date_scraped,
        };
    }
}
