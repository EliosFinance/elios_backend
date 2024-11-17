import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentTypeController } from './content-type.controller';
import { ContentTypeService } from './content-type.service';
import { ContentType } from './entities/content-type.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ContentType])],
    controllers: [ContentTypeController],
    providers: [ContentTypeService],
})
export class ContentTypeModule {}
