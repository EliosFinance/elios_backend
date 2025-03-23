import { faker } from '@faker-js/faker';
import { CreateEnterpriseDto } from '../api/enterprises/dto/create-enterprise.dto';
import { axiosClient } from './AxiosClient';

export const seedEnterprises = async () => {
    const enterprises = await axiosClient.get('/enterprises');
    if (process.env.NODE_ENV !== 'development') {
        console.error('Seeding is only allowed in development mode');
        return;
    }
    if (enterprises.data.length > 0) {
        console.error('Enterprises already seeded');
        return;
    }

    console.log('Seeding enterprises...');

    for (let i = 0; i < 10; i++) {
        const enterpriseData: CreateEnterpriseDto = {
            name: faker.company.name(),
            description: faker.company.catchPhrase(),
        };
        try {
            const response = await axiosClient.post('/enterprises', enterpriseData);
            console.log(`Enterprise created: ${response.data.name}`);
        } catch (error: any) {
            console.error('Error creating enterprise:', JSON.stringify(error, null, 2));
        }
    }

    console.log('Enterprises have been seeded');
};
