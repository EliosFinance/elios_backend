import { faker } from '@faker-js/faker';
import { ArticleContentType } from '../api/articles/entities/article-content-entity';
import { ContentTypeCategory } from '../api/content-type/entities/content-type.entity';
import { axiosClient } from './AxiosClient';
import 'dotenv/config';

export const seedArticles = async () => {
    if (String(process.env.NODE_ENV) !== 'development') {
        console.error('Seeding is only allowed in development mode');
        return;
    }
    try {
        const categories = await axiosClient.get('/article-category');
        let categoryId: number;

        if (categories.data.length === 0) {
            const newCategory = await axiosClient.post('/article-category', {
                title: 'Finance',
                description: 'Everything about personal finance',
                icon: 'coins',
            });
            categoryId = newCategory.data.id;
            console.log(`✅ Category created: ${newCategory.data.title}`);
        } else {
            categoryId = categories.data[0].id;
            console.log(`ℹ️ Using existing category ID: ${categoryId}`);
        }

        const articles = await axiosClient.get('/articles');
        if (articles.data.length > 0) {
            console.log('ℹ️ Articles already seeded');
            return;
        }

        const articleData = {
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            authorIds: [1],
            thumbnail: faker.image.urlPicsumPhotos(),
            categoryId,
            isPremium: false,
            readingTime: 5,
            contents: [
                {
                    image: faker.image.urlPicsumPhotos(),
                    title: faker.lorem.sentence(),
                    type: ArticleContentType.FULL,
                    contentType: [
                        {
                            type: ContentTypeCategory.TEXT,
                            text: [faker.lorem.paragraph()],
                        },
                    ],
                },
                {
                    image: faker.image.urlPicsumPhotos(),
                    title: faker.lorem.words(4),
                    type: ArticleContentType.FULL,
                    contentType: [
                        {
                            type: ContentTypeCategory.LIST,
                            text: [faker.lorem.words(3), faker.lorem.words(3), faker.lorem.words(3)],
                        },
                    ],
                },
            ],
        };

        console.dir(articleData, { depth: null });
        const response = await axiosClient.post('/articles', articleData);
        console.log(`✅ Article created: ${response.data.title}`);
    } catch (error) {
        console.error('❌ Error seeding articles:', error?.response?.data || error.message);
    }
};
