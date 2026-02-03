import { Module } from '@nestjs/common';
import { DepartmentModule } from './department/department.module';
import { AssetTypeModule } from './asset-type/asset-type.module';
import { BrandModule } from './brand/brand.module';
import { VendorModule } from './vendor/vendor.module';
import { ApplicationModule } from './application/application.module';
import { SlackUserModule } from './slack-user/slack-user.module';
import { CompanyInfoModule } from './company-info/company-info.module';

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
})
export class MastersModule { }
