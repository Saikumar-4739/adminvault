import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AdministrationController } from './administration.controller';

// Services
import { SettingsService } from './settings.service';
import { PasswordVaultService } from './password-vault.service';
import { IAMService } from './iam.service';
import { AssetOperationsService } from './asset-operations.service';
import { EmailInfoService } from './email-info.service';

// Entities
import { SettingsEntity } from './entities/settings.entity';
import { PasswordVaultEntity } from './entities/password-vault.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { MFASettingsEntity } from './entities/mfa-settings.entity';
import { APIKeyEntity } from './entities/api-key.entity';
import { SSOProviderEntity } from './entities/sso-provider.entity';
import { UserLoginSessionsEntity } from './entities/user-login-sessions.entity';
import { EmailInfoEntity } from './entities/email-info.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { MenuEntity } from './entities/menu.entity';
import { RoleMenuAccessEntity } from './entities/role-menu-access.entity';
import { UserPermissionEntity } from './entities/user-permission.entity';
import { UserRoleEntity } from './entities/user-role.entity';

// Cross-feature entities
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { AssetAssignEntity } from '../asset-info/entities/asset-assign.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';

// Repositories
import { UserLoginSessionRepository } from './repositories/user-login-session.repository';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { SettingsRepository } from './repositories/settings.repository';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { MFASettingsRepository } from './repositories/mfa-settings.repository';
import { APIKeyRepository } from './repositories/api-key.repository';
import { SSOProviderRepository } from './repositories/sso-provider.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { MenuRepository } from './repositories/menu.repository';
import { RoleMenuAccessRepository } from './repositories/role-menu-access.repository';
import { UserPermissionRepository } from './repositories/user-permission.repository';
import { UserRoleRepository } from './repositories/user-role.repository';

// External Modules
import { AuthUsersModule } from '../auth-users/auth-users.module';
import { EmployeesRepository } from '../employees/repositories/employees.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SettingsEntity,
            PasswordVaultEntity,
            RoleEntity,
            PermissionEntity,
            MFASettingsEntity,
            APIKeyEntity,
            SSOProviderEntity,
            UserLoginSessionsEntity,
            AssetInfoEntity,
            AssetAssignEntity,
            AuthUsersEntity,
            EmailInfoEntity,
            RolePermissionEntity,
            EmployeesEntity,
            MenuEntity,
            RoleMenuAccessEntity,
            UserPermissionEntity,
            UserRoleEntity
        ]),
        forwardRef(() => AuthUsersModule)
    ],
    controllers: [
        AdministrationController
    ],
    providers: [
        SettingsService,
        PasswordVaultService,
        IAMService,
        AssetOperationsService,
        EmailInfoService,
        UserLoginSessionRepository,
        EmailInfoRepository,
        SettingsRepository,
        PasswordVaultRepository,
        RoleRepository,
        PermissionRepository,
        MFASettingsRepository,
        APIKeyRepository,
        SSOProviderRepository,
        SSOProviderRepository,
        RolePermissionRepository,
        RolePermissionRepository,
        EmployeesRepository,
        MenuRepository,
        RoleMenuAccessRepository,
        UserPermissionRepository,
        UserRoleRepository
    ],
    exports: [
        SettingsService,
        PasswordVaultService,
        IAMService,
        AssetOperationsService,
        EmailInfoService
    ]
})
export class AdministrationModule { }
