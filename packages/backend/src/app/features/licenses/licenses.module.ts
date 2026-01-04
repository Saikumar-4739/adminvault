
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyLicenseEntity } from './entities/company-license.entity';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([CompanyLicenseEntity])
    ],
    controllers: [LicensesController],
    providers: [LicensesService],
    exports: [LicensesService]
})
export class LicensesModule { }
