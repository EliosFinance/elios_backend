import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update-enterprise.dto';
import { Enterprise } from './entities/enterprise.entity';

@Injectable()
export class EnterprisesService {
    constructor(
        @InjectRepository(Enterprise)
        private readonly enterpriseRepository: Repository<Enterprise>,
    ) {}

    async create(createEnterpriseDto: CreateEnterpriseDto) {
        const { name, description } = createEnterpriseDto;

        const newEnterprise = this.enterpriseRepository.create({
            name,
            description,
        });

        return this.enterpriseRepository.save(newEnterprise);
    }

    async findAll() {
        return this.enterpriseRepository.find({ relations: ['challenge'] });
    }

    async findOne(id: number) {
        const enterprise = await this.enterpriseRepository.findOne({
            where: { id: id },
            relations: ['challenge'],
        });

        if (!enterprise) {
            throw new NotFoundException(`Enterprise with ID ${id} not found`);
        }

        return enterprise;
    }

    async update(id: number, updateEnterpriseDto: UpdateEnterpriseDto) {
        const enterprise = await this.findOne(id);

        Object.assign(enterprise, updateEnterpriseDto);

        return this.enterpriseRepository.save(enterprise);
    }

    async remove(id: number) {
        const enterprise = await this.findOne(id);
        await this.enterpriseRepository.remove(enterprise);
    }
}
