import { faker } from '@faker-js/faker';
import { CreateEnterpriseDto } from '../api/enterprises/dto/create-enterprise.dto';
import { axiosClient } from './AxiosClient';
import 'dotenv/config';
import { CreateQuestionDto } from 'src/api/quizz/dto/question/create-question-dto';
import { CreateQuizzDto } from 'src/api/quizz/dto/quizz/create-quizz.dto';
import { QuestionTypesEnum, QuizzDifficultyEnum } from 'src/api/quizz/entities/quizz.entity';

export const seedQuizz = async () => {
    const quizzs = await axiosClient.get('/quizz');
    if (String(process.env.NODE_ENV) !== 'development') {
        console.error('Seeding is only allowed in development mode');
        return;
    }
    if (quizzs.data.length > 0) {
        console.error('Quizz already seeded');
        return;
    }

    console.log('Seeding quizz...');

    for (let i = 0; i < 10; i++) {
        const quizzData: CreateQuizzDto = {
            challengeId: 1,
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            image: faker.image.url(),
            difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']) as QuizzDifficultyEnum,
            theme: faker.lorem.word(),
            relatedArticles: [1],
        };
        try {
            const response = await axiosClient.post('/quizz', quizzData);
            console.log(`Quizz created: ${response.data.name}`);
        } catch (error) {
            console.error('Error creating quizz:', JSON.stringify(error, null, 2));
        }
    }

    console.log('Seeding questions...');
    const questions = await axiosClient.get('/quizz/questions');
    if (questions.data.length > 0) {
        console.error('Questions already seeded');
        return;
    }

    for (let i = 0; i < 10; i++) {
        const questionData: CreateQuestionDto = {
            quizzId: i + 1,
            options: [],
            question: faker.lorem.sentence() + '?',
            explanation: faker.lorem.paragraph(),
            type: faker.helpers.arrayElement(['multiple', 'boolean']) as QuestionTypesEnum,
        };
        try {
            const response = await axiosClient.post('/quizz/questions', questionData);
            console.log(`Question created: ${response.data.title}`);
        } catch (error) {
            console.error('Error creating question:', JSON.stringify(error, null, 2));
        }
    }

    console.log('Seeding questions options...');
    const questionOptions = await axiosClient.get('/quizz/question-options');
    const seededQuestions = await axiosClient.get('/quizz/questions');

    if (seededQuestions.data.length === 0) {
        console.error('No questions found to seed options for');
        return;
    }

    if (questionOptions.data.length > 0) {
        console.error('Question options already seeded');
        return;
    }

    for (const q of seededQuestions.data) {
        const optionsCount = q.type === 'boolean' ? 2 : faker.number.int({ min: 2, max: 4 });
        const options = Array.from({ length: optionsCount }, () => ({
            text: faker.lorem.sentence(),
            isCorrect: faker.datatype.boolean(),
        }));
        const questionOptionData = {
            questionId: q.id,
            options,
        };
        try {
            await axiosClient.post('/quizz/question-options', questionOptionData);
            console.log(`Question options created for question ID ${q.id}`);
        } catch (error) {
            console.error('Error creating question options:', JSON.stringify(error, null, 2));
        }
    }

    console.log('All quizz data have been seeded');
};
