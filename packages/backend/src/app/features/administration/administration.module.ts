import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { VaultController } from './vault.controller';
import { EmailController } from './email.controller';
import { SettingsService } from './settings.service';
import { PasswordVaultService } from './password-vault.service';
import { EmailInfoService } from './email-info.service';
import { SettingsEntity } from './entities/settings.entity';
import { PasswordVaultEntity } from './entities/password-vault.entity';
import { EmailInfoEntity } from './entities/email-info.entity';
import { AccessRequestEntity } from './entities/access-request.entity';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { AssetAssignEntity } from '../asset-info/entities/asset-assign.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { SettingsRepository } from './repositories/settings.repository';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { AccessRequestRepository } from './repositories/access-request.repository';
import { AuthUsersModule } from '../auth-users/auth-users.module';
import { EmployeesRepository } from '../employees/repositories/employees.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([SettingsEntity, PasswordVaultEntity, AssetInfoEntity, AssetAssignEntity, AuthUsersEntity, EmailInfoEntity, AccessRequestEntity, EmployeesEntity]),
        forwardRef(() => AuthUsersModule)
    ],
    controllers: [SettingsController, VaultController, EmailController],
    providers: [SettingsService, PasswordVaultService, EmailInfoService, SettingsRepository, PasswordVaultRepository, EmailInfoRepository, AccessRequestRepository, EmployeesRepository],
    exports: [SettingsService, PasswordVaultService, EmailInfoService, AccessRequestRepository]
})
export class AdministrationModule { }
