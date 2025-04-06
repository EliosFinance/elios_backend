import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Connector } from './entities/connector.entity';

@Injectable()
export class PowensService {
    constructor(
        @InjectRepository(Connector)
        private readonly connectorRepository: Repository<Connector>,
    ) {}

    async syncConnector() {
        try {
            const response = await axios.get('https://lperrenot-sandbox.biapi.pro/2.0/connectors');
            const apiConnectors = response.data.connectors;

            const dbConnectors = await this.connectorRepository.find();
            const dbConnectorsMap = new Map(dbConnectors.map((connector) => [connector.uuid, connector]));
            for (const apiConnector of apiConnectors) {
                const dbConnector = dbConnectorsMap.get(apiConnector.uuid);
                if (dbConnector) {
                    const updated = this.hasConnectorChanged(dbConnector, apiConnector);
                    if (updated) {
                        await this.connectorRepository.save({
                            ...dbConnector,
                            ...this.mapApiToEntity(apiConnector),
                        });
                    }

                    dbConnectorsMap.delete(apiConnector.uuid);
                } else {
                    await this.connectorRepository.save(this.mapApiToEntity(apiConnector));
                }
            }

            for (const obsoleteConnector of dbConnectorsMap.values()) {
                await this.connectorRepository.remove(obsoleteConnector);
            }

            return { message: 'Connectors synchronized successfully.' };
        } catch (error: any) {
            console.error('Error synchronizing connectors:', error.message);
            throw new Error('Failed to synchronizing connectors:');
        }
    }

    async getSingleConnector(connector_uuid: string): Promise<Connector | null> {
        const connector = await this.connectorRepository.findOne({
            where: { uuid: connector_uuid },
        });

        return {
            ...connector,
            logo: `https://lperrenot-sandbox.biapi.pro/2.0/logos/${connector.uuid}-thumbnail.webp`,
        } as Connector;
    }

    async getAllConnectors(): Promise<Connector[]> {
        const connectors = await this.connectorRepository.find();

        return connectors.map((connector) => ({
            ...connector,
            logo: `https://lperrenot-sandbox.biapi.pro/2.0/logos/${connector.uuid}-thumbnail.webp`,
        }));
    }

    private hasConnectorChanged(dbConnector: Connector, apiConnector: any): boolean {
        return (
            dbConnector.name !== apiConnector.name ||
            dbConnector.slug !== apiConnector.slug ||
            dbConnector.color !== apiConnector.color ||
            dbConnector.code !== apiConnector.code ||
            (dbConnector.capabilities || []).toString() !== (apiConnector.capabilities || []).toString() ||
            (dbConnector.available_auth_mechanisms || []).toString() !==
                (apiConnector.available_auth_mechanisms || []).toString() ||
            (dbConnector.account_types || []).toString() !== (apiConnector.account_types || []).toString() ||
            (dbConnector.products || []).toString() !== (apiConnector.products || []).toString() ||
            (dbConnector.documents_types || []).toString() !== (apiConnector.documents_type || []).toString() ||
            dbConnector.restricted !== apiConnector.restricted ||
            dbConnector.beta !== apiConnector.beta ||
            dbConnector.hidden !== apiConnector.hidden
        );
    }

    private mapApiToEntity(apiConnector: any): Partial<Connector> {
        return {
            uuid: apiConnector.uuid,
            name: apiConnector.name,
            slug: apiConnector.slug,
            color: apiConnector.color,
            code: apiConnector.code,
            capabilities: apiConnector.capabilities,
            available_auth_mechanisms: apiConnector.available_auth_mechanisms,
            account_types: apiConnector.account_types,
            products: apiConnector.products,
            documents_types: apiConnector.documents_type,
            restricted: apiConnector.restricted,
            beta: apiConnector.beta,
            hidden: apiConnector.hidden,
        };
    }
}
