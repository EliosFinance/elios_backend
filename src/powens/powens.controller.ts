import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Post, Query, Redirect, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Public } from '../auth/decorator/public.decorator';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { Connector } from './entities/connector.entity';
import { PowensService } from './powens.service';

@Controller('powens')
@ApiTags('Powens')
export class PowensController {
    constructor(
        private readonly httpService: HttpService,
        private readonly powensService: PowensService,
        private readonly usersService: UsersService,
        private readonly transactionsService: TransactionsService,
        @InjectRepository(Connector)
        private readonly connectorRepository: Repository<Connector>,
    ) {}

    @Get('/connectors')
    async getConnectors() {
        await this.powensService.syncConnector();
        return this.powensService.getAllConnectors();
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

    @Post('add/connection')
    async addConnection(@Req() req: Request, @Body('connector_uuids') connectorUuids: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { user } = req;

        if (!connectorUuids) {
            throw new Error('No connector uuids found.');
        }
        // console.log('user', user);
        // const response = await axios.post(`https://lperrenot-sandbox.biapi.pro/2.0/users/${user.powens_id}/connections`,
        //   {
        //       connector_uuid: '07d76adf-ae35-5b38-aca8-67aafba13169'
        //   },
        //   {
        //     headers: {
        //         Authorization: `Bearer ${user.powens_token}`,
        //     }
        // })
        // console.log(response.data)
        const redirectUri = encodeURIComponent('http://localhost:3333/powens/callback');
        const url = `https://webview.powens.com/fr/connect?&client_id=70395459&redirect_uri=${redirectUri}&domain=lperrenot-sandbox.biapi.pro&connector_uuids=${connectorUuids}&code=${user.powens_token}`;
        return {
            url,
        };
    }

    @Public()
    @Get('callback')
    async connectionCallback(@Query() query: any) {
        console.log('Callback body', query);
        return {
            message: 'Callback body',
            data: query,
        };
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
