import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { DepartmentRepository, DesignationRepository, AssetTypeRepository, BrandRepository, VendorRepository, LocationRepository, TicketCategoryRepository } from '../../repository/masters/masters.repository';
import { DepartmentEntity } from '../../entities/masters/department.entity';
import { DesignationEntity } from '../../entities/masters/designation.entity';
import { AssetTypeEntity } from '../../entities/masters/asset-type.entity';
import { BrandEntity } from '../../entities/masters/brand.entity';
import { VendorEntity } from '../../entities/masters/vendor.entity';
import { LocationEntity } from '../../entities/masters/location.entity';
import { TicketCategoryEntity } from '../../entities/masters/ticket-category.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DepartmentEntity,
            DesignationEntity,
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
        DesignationRepository,
        AssetTypeRepository,
        BrandRepository,
        VendorRepository,
        LocationRepository,
        TicketCategoryRepository
    ],
    exports: [MastersService]
})
export class MastersModule { }
