import { faker } from '@faker-js/faker';
import { ArticleCategory } from 'src/article-category/entities/article-category.entity';
import { CreateArticleContentDto } from 'src/article-content/dto/create-article-content-dto';
import { ArticleContentType } from 'src/article-content/entities/article-content.entity';
import { CreateArticleDto } from 'src/articles/dto/create-article.dto';
import { CreateContentTypeDto } from 'src/content-type/dto/create-content-type.dto';
import { ContentTypeCategory } from 'src/content-type/entities/content-type.entity';
import { User } from 'src/users/entities/user.entity';
import { axiosClient } from './AxiosClient';

export const seedArticles = async () => {
    const articles = await axiosClient.get(`/articles`);

    if (process.env.NODE_ENV !== 'development') {
        console.error('Seeding is only allowed in development mode');
        return;
    }
    if (articles.data.length > 0) {
        console.error('Articles already seeded');
        return;
    }

    console.log('Seeding articles...');

    // Récupérer les catégories et les utilisateurs existants
    let categories: ArticleCategory[] = [],
        users: User[] = [];
    try {
        const categoryResponse = await axiosClient.get(`/article-category`);
        categories = categoryResponse.data;

        const userResponse = await axiosClient.get(`/users`);
        users = userResponse.data;
    } catch (error) {
        console.error('Error fetching categories or users:', error.response?.data || error.message);
        return;
    }

    if (categories.length === 0 || users.length === 0) {
        console.error('No categories or users found in the database. Please seed categories and users first.');
        return;
    }

    for (let i = 0; i < 10; i++) {
        const articleData: CreateArticleDto = {
            title: faker.lorem.words(3),
            description: faker.lorem.paragraph(),
            thumbnail: faker.image.url(),
            isPremium: false,
            contents: [],
            categoryId: categories[Math.floor(Math.random() * categories.length)].id,
            authorIds: [users[Math.floor(Math.random() * users.length)].id],
        };

        try {
            const response = await axiosClient.post('/articles', articleData);
            console.log(`Article created: ${response.data.title}`);

            // Créer des contenus pour l'article
            for (let j = 0; j < 3; j++) {
                const articleContentData: CreateArticleContentDto = {
                    title: faker.lorem.words(2),
                    image: faker.image.url(),
                    type: faker.helpers.arrayElement([
                        'preview',
                        'small_preview',
                        'full',
                        'full_rounded_image',
                    ]) as ArticleContentType,
                    readsUserId: [],
                    savedUserId: [],
                    contentType: [],
                    articleId: response.data.id,
                };

                const contentResponse = await axiosClient.post(`/article-content`, articleContentData);
                console.log(`Article content created: ${contentResponse.data.title}`);

                // Créer des types de contenu pour chaque contenu d'article
                for (let k = 0; k < 2; k++) {
                    const contentTypeData: CreateContentTypeDto = {
                        type: faker.helpers.arrayElement(['text', 'list', 'image', 'video']) as ContentTypeCategory,
                        text: [faker.lorem.sentence()],
                        articleContentId: contentResponse.data.id,
                    };

                    await axiosClient.post('/content-type', contentTypeData);
                    console.log(`Content type created: ${contentTypeData.type}`);
                }
            }
        } catch (error) {
            console.error('Error creating article or its contents:', error.response?.data || error?.message || error);
        }
    }

    console.log('Articles have been seeded');
};
