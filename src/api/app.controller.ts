import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller('test')
@ApiTags('test')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('TEST')
    async test(): Promise<string> {
        await this.appService.test();
        return 'job added to the queue';
    }
}
