import { Test, TestingModule } from '@nestjs/testing';
import { PowensService } from './powens.service';

describe('PowensService', () => {
    let service: PowensService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PowensService],
        }).compile();

        service = module.get<PowensService>(PowensService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
