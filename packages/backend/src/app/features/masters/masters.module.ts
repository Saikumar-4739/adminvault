import { Module } from '@nestjs/common';
import { DepartmentModule } from './department/department.module';
import { AssetTypeModule } from './asset-type/asset-type.module';
import { BrandModule } from './brand/brand.module';
import { VendorModule } from './vendor/vendor.module';
import { LocationModule } from './location/location.module';
import { ApplicationModule } from './application/application.module';
import { TicketCategoryModule } from './ticket-category/ticket-category.module';
import { PasswordVaultModule } from './password-vault/password-vault.module';
import { SlackUserModule } from './slack-user/slack-user.module';
import { CompanyInfoModule } from './company-info/company-info.module';
import { DeviceInfoModule } from './device-info/device-info.module';

@Module({
    imports: [
        DepartmentModule,
        AssetTypeModule,
        BrandModule,
        VendorModule,
        LocationModule,
        ApplicationModule,
        TicketCategoryModule,
        PasswordVaultModule,
        SlackUserModule,
        CompanyInfoModule,
        DeviceInfoModule
    ],
})
export class MastersModule { }
