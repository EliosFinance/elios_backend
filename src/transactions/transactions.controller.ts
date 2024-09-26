import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@ApiTags('Transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}
}
