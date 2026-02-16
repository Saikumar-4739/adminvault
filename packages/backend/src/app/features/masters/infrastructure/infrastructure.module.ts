import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfrastructureService } from './infrastructure.service';
import { InfrastructureController } from './infrastructure.controller';
import { InfrastructureMasterEntity } from './entities/infrastructure.entity';
import { InfrastructureRepository } from './repositories/infrastructure.repository';

@Module({
    imports: [TypeOrmModule.forFeature([InfrastructureMasterEntity])],
    controllers: [InfrastructureController],
    providers: [InfrastructureService, InfrastructureRepository],
    exports: [InfrastructureService],
})
export class InfrastructureModule { }
