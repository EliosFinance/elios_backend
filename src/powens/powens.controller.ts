import { Controller, Redirect, Get, Query, Req } from '@nestjs/common';
import { PowensService } from './powens.service';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';
import { Public } from '../auth/decorator/public.decorator';
import { TransactionsService } from '../transactions/transactions.service';

@Controller('powens')
export class PowensController {
    constructor(
        private readonly httpService: HttpService,
        private readonly powensService: PowensService,
        private readonly usersService: UsersService,
        private readonly transactionsService: TransactionsService,
    ) {}

    @Get()
    getSmallToken(@Req() req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return `https://lperrenot-sandbox.biapi.pro/2.0/auth/webview/connect?client_id=70395459&redirect_uri=http://localhost:3333/powens/get?userId=${req.user.id}`;
    }

    @Public()
    @Get('get')
    @Redirect('http://localhost:5173/', 301)
    async getBigToken(@Query() query: any) {
        const { code, userId } = query;
        try {
            const response = await lastValueFrom(
                this.httpService.post('https://lperrenot-sandbox.biapi.pro/2.0/auth/token/access', {
                    code,
                    client_id: '70395459',
                    client_secret: 'j7IX1ETJ4zyRUt8XucEaSSsuEz/oYhCK',
                }),
            );

            const tokenData = response.data;
            await this.usersService.updateUser(userId, {
                powens_token: tokenData.access_token,
            });
            return {
                url: `http://localhost:5173/?token=${tokenData.access_token}`,
            };
        } catch (error) {
            console.error('Error fetching token: ', error);
        }
    }

    @Get('transactions')
    async getTransactions(@Req() req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { user } = req;
        if (!user.powens_token) {
            throw new Error('No powens token');
        }

        let userTransaction = await this.transactionsService.getUserTransactions(user.id, 'ASC');

        let apiUrl = 'https://lperrenot-sandbox.biapi.pro/2.0/users/me/transactions?limit=1000';

        if (userTransaction.length > 0) {
            const lastUpdate = userTransaction[userTransaction.length - 1].date;
            apiUrl += `&last_update=${lastUpdate}`;
        }

        let response = await lastValueFrom(
            this.httpService.get(apiUrl, {
                headers: {
                    Authorization: `Bearer ${user.powens_token}`,
                },
            }),
        );

        let transactions = response.data.transactions;
        await this.transactionsService.saveTransactions(transactions, user.id);

        while (response.data._links.next) {
            response = await lastValueFrom(
                this.httpService.get(response.data._links.next, {
                    headers: {
                        Authorization: `Bearer ${user.powens_token}`,
                    },
                }),
            );
            transactions = response.data.transactions;
            await this.transactionsService.saveTransactions(transactions, user.id);
        }

        userTransaction = await this.transactionsService.getUserTransactions(user.id);
        return userTransaction;
    }

    @Get('connections')
    async getConnectionsUsers(@Req() req: Request) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { user } = req;
        if (!user.powens_token) {
            throw new Error('No powens token');
        }

        const response = await lastValueFrom(
            this.httpService.get(
                'https://lperrenot-sandbox.biapi.pro/2.0/users/me/connections?expand=connector,accounts,subscriptions',
                {
                    headers: {
                        Authorization: `Bearer ${user.powens_token}`,
                    },
                },
            ),
        );

        return response.data.connections;
    }
}
