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
import { DepartmentsMasterEntity } from '../../entities/masters/department.entity';
import { AssetTypeMasterEntity } from '../../entities/masters/asset-type.entity';
import { BrandsMasterEntity } from '../../entities/masters/brand.entity';
import { VendorsMasterEntity } from '../../entities/masters/vendor.entity';
import { LocationsMasterEntity } from '../../entities/masters/location.entity';
import { TicketCategoriesMasterEntity } from '../../entities/masters/ticket-category.entity';
import { ApplicationsMasterEntity } from '../../entities/masters/application.entity';
import { ExpenseCategoriesMasterEntity } from '../../entities/masters/expense-category.entity';
import { CompanyInfoRepository } from '../../repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DepartmentsMasterEntity,
            AssetTypeMasterEntity,
            BrandsMasterEntity,
            VendorsMasterEntity,
            LocationsMasterEntity,
            TicketCategoriesMasterEntity,
            ApplicationsMasterEntity,
            ExpenseCategoriesMasterEntity
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
        TicketCategoryRepository,
        CompanyInfoRepository
    ],
    exports: [MastersService]
})
export class MastersModule { }
