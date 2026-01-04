import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';
import { DepartmentRepository } from './repositories/department.repository';
import { AssetTypeRepository } from './repositories/asset-type.repository';
import { BrandRepository } from './repositories/brand.repository';
import { VendorRepository } from './repositories/vendor.repository';
import { LocationRepository } from './repositories/location.repository';
import { TicketCategoryRepository } from './repositories/ticket-category.repository';
import { DepartmentsMasterEntity } from './entities/department.entity';
import { AssetTypeMasterEntity } from './entities/asset-type.entity';
import { BrandsMasterEntity } from './entities/brand.entity';
import { VendorsMasterEntity } from './entities/vendor.entity';
import { LocationsMasterEntity } from './entities/location.entity';
import { TicketCategoriesMasterEntity } from './entities/ticket-category.entity';
import { ApplicationsMasterEntity } from './entities/application.entity';
import { ExpenseCategoriesMasterEntity } from './entities/expense-category.entity';
import { PasswordVaultMasterEntity } from './entities/password-vault.entity';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { CompanyInfoRepository } from './repositories/company-info.repository';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

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
            ExpenseCategoriesMasterEntity,
            PasswordVaultMasterEntity
        ]),
        AuditLogsModule
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
        CompanyInfoRepository,
        PasswordVaultRepository
    ],
    exports: [MastersService]
})
export class MastersModule { }
