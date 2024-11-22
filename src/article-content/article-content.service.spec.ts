import { Test, TestingModule } from '@nestjs/testing';
import { ArticleContentService } from './article-content.service';

describe('ArticleContentService', () => {
    let service: ArticleContentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ArticleContentService],
        }).compile();

        service = module.get<ArticleContentService>(ArticleContentService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
