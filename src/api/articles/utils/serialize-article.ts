import { toUserLightList } from '../../users/dto/user.utils';
import { Article } from '../entities/article.entity';

export function serializeArticle(article: Article): any {
    if (!article) return null;

    return {
        ...article,
        authors: toUserLightList(article.authors),
        likes: toUserLightList(article.likes),
        reads: toUserLightList(article.reads),
        saved: toUserLightList(article.saved),
        articleContent: article.articleContent ?? [],
    };
}
