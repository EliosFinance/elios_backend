import { faker } from '@faker-js/faker';
import { CreateArticleCategoryDto } from '@src/api/articles/dto/article-category-dtos';
import { CreateArticleContentDto } from '@src/api/articles/dto/article-content-dtos';
import { CreateArticleDto } from '@src/api/articles/dto/article-dtos';
import { ArticleCategory } from '@src/api/articles/entities/article-category-entity';
import { ArticleContentType } from '@src/api/articles/entities/article-content-entity';
import { CreateContentTypeDto } from '../api/content-type/dto/create-content-type.dto';
import { ContentTypeCategory } from '../api/content-type/entities/content-type.entity';
import { User } from '../api/users/entities/user.entity';
import { axiosClient } from './AxiosClient';

export enum ArticleCategoriesEnum {
    EPARGNE = 'Epargne',
    INVESTISSEMENT = 'Investissement',
    VIDEOS = 'Vidéos',
    ACTUALITES = 'Actualités',
    IMMOBILIER = 'Immobilier',
    CRYPTO = 'Crypto',
    BOURSE = 'Bourse',
    FISCAL = 'Fiscal',
    RETRAITE = 'Retraite',
    ASSURANCE = 'Assurance',
    BANQUE = 'Banque',
    CREDIT = 'Crédit',
    BUDGET = 'Budget',
    EMPLOI = 'Emploi',
    ENTREPRENEURIAT = 'Entrepreneuriat',
    LIVRES = 'Livres',
    FORMATION = 'Formation',
    WEBINAIRE = 'Webinaire',
    EVENEMENT = 'Evénement',
    INTERVIEW = 'Interview',
    PODCAST = 'Podcast',
    MINDSET = 'Mindset',
    BIEN_ETRE = 'Bien-être',
    DEVELOPPEMENT_PERSONNEL = 'Développement personnel',
    COACHING = 'Coaching',
    SPIRITUALITE = 'Spiritualité',
    RELATION = 'Relation',
    FAMILLE = 'Famille',
    EDUCATION = 'Education',
}

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
    let users: User[] = [];
    try {
        const userResponse = await axiosClient.get(`/users`);
        users = userResponse.data;
    } catch (error: any) {
        console.error('Error fetching users:', error.response?.data || error.message);
        return;
    }

    if (users.length === 0) {
        console.error('No users found in the database. Please seed users first.');
        return;
    }

    const categories: ArticleCategory[] = [];
    for (const category of Object.values(ArticleCategoriesEnum)) {
        const categoryData: CreateArticleCategoryDto = {
            title: category,
            description: faker.lorem.paragraph(),
            icon: faker.image.url(),
            articlesId: [],
        };

        try {
            const response = await axiosClient.post('/article-category', categoryData);
            categories.push(response.data);
            console.log(`Category created: ${response.data.title}`);
        } catch (error: any) {
            console.error('Error creating category:', error.response?.data || error.message);
            return;
        }
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
            for (let j = 0; j < 7; j++) {
                const articleContentData: CreateArticleContentDto = {
                    title: faker.lorem.words(2),
                    image: faker.image.url(),
                    type: faker.helpers.arrayElement(['full', 'full_rounded_image']) as ArticleContentType,
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
                        type: faker.helpers.arrayElement(['text', 'list', 'image']) as ContentTypeCategory,
                        text: [faker.lorem.sentence()],
                        articleContentId: contentResponse.data.id,
                    };

                    await axiosClient.post('/content-type', contentTypeData);
                    console.log(`Content type created: ${contentTypeData.type}`);
                }
            }
        } catch (error: any) {
            console.error('Error creating article or its contents:', error.response?.data || error?.message || error);
        }
    }

    console.log('Articles have been seeded');
};
