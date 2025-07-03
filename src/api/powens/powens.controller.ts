import { Body, Controller, Delete, Get, Post, Query, Redirect, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { StateService } from '../../state.service';
import { Public } from '../auth/decorator/public.decorator';
import { TransactionsService } from '../transactions/transactions.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Connector } from './entities/connector.entity';
import { PowensService } from './powens.service';

@Controller('powens')
@ApiTags('Powens')
export class PowensController {
    constructor(
        private readonly powensService: PowensService,
        private readonly usersService: UsersService,
        private readonly transactionsService: TransactionsService,
        private readonly stateService: StateService,
    ) {}

    @Get('/connector')
    async getSingleConnector(@Req() req: Request, @Query('uuid') connector_uuid: string) {
        return this.powensService.getSingleConnector(connector_uuid);
    }

    @Get('/connectors')
    async getConnectors() {
        await this.powensService.syncConnector();
        return this.powensService.getAllConnectors();
    }

    @Public()
    @Get('get')
    @Redirect('http://localhost:5173/', 301)
    async getBigToken(@Query() query: any) {
        return await this.powensService.getBigToken(query);
    }

    @Get('transactions')
    async getTransactions(@UserFromRequest() user: User) {
        if (!user.powens_token) {
            throw new Error('No powens token');
        }

        return this.transactionsService.syncTransactions(user.id, user.powens_token);
    }

    @Post('add/connection')
    async addConnection(
        @Req() req: Request,
        @Body('connector_uuids') connectorUuids: string,
        @Body('connection_id') connection_id?: string,
    ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { user } = req;

        if (!connectorUuids && !connection_id) {
            throw new Error('No connector uuids found.');
        }
        const state = uuidv4();
        await this.stateService.saveState(state, user.id);

        const redirectUri = `http://localhost:3333/powens/callback?state=${state}`;

        const connection_id_parameter = connection_id ? `&connection_id=${connection_id}` : '';
        const connector_uuids_parameter = connectorUuids ? `&connector_uuids=${connectorUuids}` : '';

        const url = `https://webview.powens.com/fr/connect?state=refreshBanks?&client_id=${process.env.POWENS_CLIENT_ID}&redirect_uri=${redirectUri}&domain=${process.env.POWENS_CLIENT_DOMAIN}${connector_uuids_parameter}${connection_id_parameter}&code=${user.powens_token}`;
        return {
            url,
        };
    }

    @Post('refresh/connection')
    async refreshConnection(@UserFromRequest() user: User, @Body('connection_id') connection_id?: string) {
        if (!connection_id) {
            throw new Error('No connector uuids found.');
        }
        const state = uuidv4();
        await this.stateService.saveState(state, user.id);

        const redirectUri = `http://localhost:3333/powens/callback?state=${state}`;

        const connection_id_parameter = connection_id ? `&connection_id=${connection_id}` : '';

        const url = `https://webview.powens.com/fr/reconnect?client_id=${process.env.POWENS_CLIENT_ID}&redirect_uri=${redirectUri}&domain=${process.env.POWENS_CLIENT_DOMAIN}${connection_id_parameter}&code=${user.powens_token}`;
        return {
            url,
        };
    }

    @Public()
    @Get('callback')
    @Redirect('http://localhost:5173/settings/bank-accounts', 302)
    async connectionCallback(@Query() query: any, @Req() req: Request) {
        let finalState = query.state;
        if (!query.state) {
            throw new Error('No state provided');
        }

        if (Array.isArray(query.state)) {
            // find the uuid-like string
            finalState = query.state.find((state: string) =>
                state.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
            );
        }

        const userId = await this.stateService.getUserIdFromState(finalState);
        if (!userId) {
            throw new Error('No user id provided');
        }

        const user = await this.usersService.findOne(userId);

        if (!user || !user.powens_token) {
            throw new Error('No user id or powens token provided');
        }

        if (!user.powens_token) {
            throw new Error('No powens token');
        }

        if (!query.connection_id) {
            throw new Error('No connector uuids found.');
        }

        await this.transactionsService.syncTransactions(user.id, user.powens_token);

        return;
    }

    @Get('connections')
    async getConnectionsUsers(@UserFromRequest() user: User) {
        if (!user.powens_token) {
            throw new Error('No powens token');
        }

        return await this.powensService.getUserConnections(user);
    }

    @Delete('delete/connections')
    async deleteConnection(@UserFromRequest() user: User, @Body('connectionId') connectionId: string) {
        if (!user.powens_token) {
            throw new Error('No powens token');
        }

        if (!connectionId) {
            throw new Error('No connection id provided');
        }

        return await this.powensService.deleteUserConnection(user, connectionId);
    }
}
