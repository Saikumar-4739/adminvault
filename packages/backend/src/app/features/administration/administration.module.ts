import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { SettingsController } from './settings.controller';
import { VaultController } from './vault.controller';
import { EmailController } from './email.controller';
import { SystemController } from './system.controller';

// Services
import { SettingsService } from './settings.service';
import { PasswordVaultService } from './password-vault.service';
import { EmailInfoService } from './email-info.service';
import { SeedService } from './seed.service';

// Entities
import { SettingsEntity } from './entities/settings.entity';
import { PasswordVaultEntity } from './entities/password-vault.entity';
import { UserLoginSessionsEntity } from './entities/user-login-sessions.entity';
import { EmailInfoEntity } from './entities/email-info.entity';

// Cross-feature entities
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { AssetAssignEntity } from '../asset-info/entities/asset-assign.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';

// Repositories
import { SettingsRepository } from './repositories/settings.repository';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { UserLoginSessionRepository } from './repositories/user-login-session.repository';

// External Modules
import { AuthUsersModule } from '../auth-users/auth-users.module';
import { EmployeesRepository } from '../employees/repositories/employees.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SettingsEntity,
            PasswordVaultEntity,
            UserLoginSessionsEntity,
            AssetInfoEntity,
            AssetAssignEntity,
            AuthUsersEntity,
            EmailInfoEntity,
            EmployeesEntity
        ]),
        forwardRef(() => AuthUsersModule)
    ],
    controllers: [
        SettingsController,
        VaultController,
        EmailController,
        SystemController
    ],
    providers: [
        SettingsService,
        PasswordVaultService,
        EmailInfoService,
        SeedService,
        SettingsRepository,
        PasswordVaultRepository,
        EmailInfoRepository,
        UserLoginSessionRepository,
        EmployeesRepository
    ],
    exports: [
        SettingsService,
        PasswordVaultService,
        EmailInfoService,
        UserLoginSessionRepository
    ]
})
export class AdministrationModule { }
