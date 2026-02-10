import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { EmailController } from './email.controller';
import { SettingsService } from './settings.service';
import { EmailInfoService } from './email-info.service';
import { SettingsEntity } from './entities/settings.entity';
import { EmailInfoEntity } from './entities/email-info.entity';
import { AccessRequestEntity } from './entities/access-request.entity';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { AssetAssignEntity } from '../asset-info/entities/asset-assign.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { SettingsRepository } from './repositories/settings.repository';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { AccessRequestRepository } from './repositories/access-request.repository';
import { AuthUsersModule } from '../auth-users/auth-users.module';
import { EmployeesRepository } from '../employees/repositories/employees.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([SettingsEntity, AssetInfoEntity, AssetAssignEntity, AuthUsersEntity, EmailInfoEntity, AccessRequestEntity, EmployeesEntity]),
        forwardRef(() => AuthUsersModule)
    ],
    controllers: [SettingsController, EmailController],
    providers: [SettingsService, EmailInfoService, SettingsRepository, EmailInfoRepository, AccessRequestRepository, EmployeesRepository],
    exports: [SettingsService, EmailInfoService, AccessRequestRepository]
})
export class AdministrationModule { }
