import { Test, TestingModule } from '@nestjs/testing';
import { PowensController } from './powens.controller';
import { PowensService } from './powens.service';

describe('PowensController', () => {
  let controller: PowensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowensController],
      providers: [PowensService],
    }).compile();

    controller = module.get<PowensController>(PowensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
