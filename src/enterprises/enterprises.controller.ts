import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { EnterprisesService } from './enterprises.service';

@Controller('enterprises')
@ApiTags('Enterprises')
export class EnterprisesController {
    constructor(private readonly enterprisesService: EnterprisesService) {}

    @Post()
    create(@Body() createEnterpriseDto: CreateEnterpriseDto) {
        console.log('je rentre la');
        return this.enterprisesService.create(createEnterpriseDto);
    }

    @Get()
    findAll() {
        return this.enterprisesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.enterprisesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEnterpriseDto: UpdateEnterpriseDto) {
        return this.enterprisesService.update(+id, updateEnterpriseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.enterprisesService.remove(+id);
    }
}
