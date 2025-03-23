import { faker } from '@faker-js/faker';
import { ChallengeEventEnum, ChallengeStepsEnum } from '@src/types/ChallengeStepsTypes';
import { CreateChallengeDto } from '../api/challenges/dto/create-challenge-dto';
import { CategoryChallenge } from '../api/challenges/entities/challenge.entity';
import { Enterprise } from '../api/enterprises/entities/enterprise.entity';
import { axiosClient } from './AxiosClient';

export const seedChallenges = async () => {
    const challenges = await axiosClient.get('/challenges');
    if (process.env.NODE_ENV !== 'development') {
        console.error('Seeding is only allowed in development mode');
        return;
    }

    if (challenges.data.length > 0) {
        console.error('Challenges already seeded');
        return;
    }

    console.log('Seeding challenges...');

    // Récupérer les entreprises existantes
    let enterprises: Enterprise[] = [];
    try {
        const response = await axiosClient.get('/enterprises');
        enterprises = response.data;
    } catch (error: any) {
        console.error('Error fetching enterprises:', error.response?.data || error.message);
        return;
    }

    if (enterprises.length === 0) {
        console.error('No enterprises found in the database. Please seed enterprises first.');
        return;
    }

    for (let i = 0; i < 10; i++) {
        const challengeData: CreateChallengeDto = {
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            enterpriseId: enterprises[Math.floor(Math.random() * enterprises.length)].id,
            image: faker.image.url(),
            category: faker.helpers.arrayElement([
                'Budget',
                'Investissement',
                'Economie',
                'Finance',
                'Developement',
                'Personal',
            ]) as CategoryChallenge,
            stateMachineConfig: {
                id: faker.string.uuid(),
                initial: ChallengeStepsEnum.PENDING,
                states: {
                    [ChallengeStepsEnum.PENDING]: {
                        on: {
                            [ChallengeEventEnum.START]: { target: ChallengeStepsEnum.START },
                        },
                    },
                    [ChallengeStepsEnum.START]: {
                        on: {
                            [ChallengeEventEnum.IN_PROGRESS]: {
                                target: [ChallengeStepsEnum.PROGRESS],
                            },
                        },
                    },
                    [ChallengeStepsEnum.PROGRESS]: {
                        on: {
                            [ChallengeEventEnum.REWARD_TO_CLAIM]: {
                                target: [ChallengeStepsEnum.REWARD_CLAIMED],
                            },
                        },
                    },
                    [ChallengeStepsEnum.REWARD_CLAIMED]: {
                        on: {
                            [ChallengeEventEnum.CLOSE]: {
                                target: [ChallengeStepsEnum.END],
                            },
                        },
                    },
                    [ChallengeStepsEnum.EXPIRE]: {
                        on: {
                            [ChallengeEventEnum.CLOSE]: {
                                target: [ChallengeStepsEnum.END],
                            },
                        },
                    },
                    [ChallengeStepsEnum.END]: {},
                },
            },
        };

        try {
            const response = await axiosClient.post('/challenges', challengeData);
            console.log(`Challenge created: ${response.data.title}`);
        } catch (error: any) {
            console.error('Error creating challenge:', error?.response?.data || error?.message || error);
            return;
        }
    }

    console.log('Challenges have been seeded');
};
