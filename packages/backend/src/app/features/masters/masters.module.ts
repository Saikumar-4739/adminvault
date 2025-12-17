import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { DepartmentRepository } from '../../repository/masters/department.repository';
import { AssetTypeRepository } from '../../repository/masters/asset-type.repository';
import { BrandRepository } from '../../repository/masters/brand.repository';
import { VendorRepository } from '../../repository/masters/vendor.repository';
import { LocationRepository } from '../../repository/masters/location.repository';
import { TicketCategoryRepository } from '../../repository/masters/ticket-category.repository';
import { DepartmentEntity } from '../../entities/masters/department.entity';
import { AssetTypeEntity } from '../../entities/masters/asset-type.entity';
import { BrandEntity } from '../../entities/masters/brand.entity';
import { VendorEntity } from '../../entities/masters/vendor.entity';
import { LocationEntity } from '../../entities/masters/location.entity';
import { TicketCategoryEntity } from '../../entities/masters/ticket-category.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DepartmentEntity,
            AssetTypeEntity,
            BrandEntity,
            VendorEntity,
            LocationEntity,
            TicketCategoryEntity
        ])
    ],
    controllers: [MastersController],
    providers: [
        MastersService,
        DepartmentRepository,
        AssetTypeRepository,
        BrandRepository,
        VendorRepository,
        LocationRepository,
        TicketCategoryRepository
    ],
    exports: [MastersService]
})
export class MastersModule { }
