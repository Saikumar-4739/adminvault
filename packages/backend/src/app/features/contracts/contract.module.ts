import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractEntity } from './entities/contract.entity';
import { ContractRepository } from './repositories/contract.repository';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ContractEntity])],
    providers: [ContractRepository, ContractService],
    controllers: [ContractController],
    exports: [ContractService]
})
export class ContractModule { }
