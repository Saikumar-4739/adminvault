import { Module } from '@nestjs/common';
import { DepartmentModule } from './department/department.module';
import { AssetTypeModule } from './asset-type/asset-type.module';
import { BrandModule } from './brand/brand.module';
import { VendorModule } from './vendor/vendor.module';
import { LicenseModule } from './license/license.module';
import { SlackUserModule } from './slack-user/slack-user.module';
import { CompanyInfoModule } from './company-info/company-info.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { RemoteModule } from './remote/remote.module';

import { MastersBulkController } from './bulk-import/masters-bulk.controller';
import { MastersBulkService } from './bulk-import/masters-bulk.service';

@Module({
    imports: [
        DepartmentModule,
        AssetTypeModule,
        BrandModule,
        VendorModule,
        LicenseModule,
        SlackUserModule,
        CompanyInfoModule,
        InfrastructureModule,
        RemoteModule
    ],
    controllers: [MastersBulkController],
    providers: [MastersBulkService],
})
export class MastersModule { }
