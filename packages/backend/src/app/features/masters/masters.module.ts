import { Module } from '@nestjs/common';
import { DepartmentModule } from './department/department.module';
import { AssetTypeModule } from './asset-type/asset-type.module';
import { BrandModule } from './brand/brand.module';
import { VendorModule } from './vendor/vendor.module';
import { ApplicationModule } from './application/application.module';
import { SlackUserModule } from './slack-user/slack-user.module';
import { CompanyInfoModule } from './company-info/company-info.module';

import { MastersBulkController } from './bulk-import/masters-bulk.controller';
import { MastersBulkService } from './bulk-import/masters-bulk.service';

@Module({
    imports: [
        DepartmentModule,
        AssetTypeModule,
        BrandModule,
        VendorModule,
        ApplicationModule,
        SlackUserModule,
        CompanyInfoModule
    ],
    controllers: [MastersBulkController],
    providers: [MastersBulkService],
})
export class MastersModule { }
