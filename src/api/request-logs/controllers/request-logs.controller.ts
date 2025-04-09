import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserFromRequest } from '@src/helpers/jwt/user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestLogsService } from '../services/request-logs.service';

@ApiTags('Request Logs')
@Controller('request-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class RequestLogsController {
    constructor(private readonly requestLogsService: RequestLogsService) {}

    @Get()
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async findAll(@Query('limit') limit = 100, @Query('offset') offset = 0) {
        return this.requestLogsService.findAll(+limit, +offset);
    }

    @Get('my-requests')
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'offset', required: false, type: Number })
    async findMyRequests(@UserFromRequest() user: any, @Query('limit') limit = 100, @Query('offset') offset = 0) {
        return this.requestLogsService.findByUserId(user.id, +limit, +offset);
    }
}
