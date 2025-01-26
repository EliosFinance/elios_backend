import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, Post, Query, Redirect, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StateService } from '../../state.service';
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
        private readonly stateService: StateService,
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

        return this.transactionsService.syncTransactions(user.id, user.powens_token);
    }

    @Post('add/connection')
    async addConnection(@Req() req: Request, @Body('connector_uuids') connectorUuids: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { user } = req;
        if (!connectorUuids) {
            throw new Error('No connector uuids found.');
        }
        const state = uuidv4();
        await this.stateService.saveState(state, user.id);
        const redirectUri = `http://localhost:3333/powens/callback?state=${state}`;
        const url = `https://webview.powens.com/fr/connect?state=refreshBanks?&client_id=70395459&redirect_uri=${redirectUri}&domain=lperrenot-sandbox.biapi.pro&connector_uuids=${connectorUuids}&code=${user.powens_token}`;
        return {
            url,
        };
    }

    @Public()
    @Get('callback')
    async connectionCallback(@Query() query: any, @Req() req: Request) {
        if (!query.state) {
            throw new Error('No state provided');
        }

        const userId = await this.stateService.getUserIdFromState(query.state);
        if (!userId) {
            throw new Error('No user id provided');
        }

        const user = await this.usersService.findOne(userId);

        if (!user || !user.powens_token) {
            throw new Error('No user id or powens token provided');
        }

        console.log('Callback body', query);
        if (!user.powens_token) {
            throw new Error('No powens token');
        }

        if (!query.connection_id) {
            throw new Error('No connector uuids found.');
        }

        const transactions = await this.transactionsService.syncTransactions(user.id, user.powens_token);
        return {
            message: 'Transactions synchronized successfully.',
            data: transactions,
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

    @Delete('delete/connections')
    async deleteConnection(@Req() req: Request, @Body('connectionId') connectionId: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { user } = req;
        if (!user.powens_token || !user.powens_id) {
            throw new Error('No powens token');
        }

        const response = await axios.delete(
            `https://lperrenot-sandbox.biapi.pro/2.0/users/me/connections/${connectionId}`,
            {
                headers: {
                    Authorization: `Bearer ${user.powens_token}`,
                },
            },
        );

        return response.data;
    }
}
