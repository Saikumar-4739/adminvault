import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { LicensesMasterEntity } from './entities/license.entity';
import { LicenseRepository } from './repositories/license.repository';

@Module({
    imports: [TypeOrmModule.forFeature([LicensesMasterEntity])],
    controllers: [LicenseController],
    providers: [LicenseService, LicenseRepository],
    exports: [LicenseService],
})
export class LicenseModule { }
