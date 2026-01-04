import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../../entities/role.entity';
import { PermissionEntity } from '../../entities/permission.entity';
import { AuthUsersEntity } from '../../entities/auth-users.entity';
import { MFASettingsEntity } from '../../entities/mfa-settings.entity';
import { APIKeyEntity } from '../../entities/api-key.entity';
import { SSOProviderEntity } from '../../entities/sso-provider.entity';

import { RolesService } from './services/roles.service';
import { PermissionsService } from './services/permissions.service';
import { MFAService } from './services/mfa.service';
import { APIKeyService } from './services/api-key.service';
import { SSOService } from './services/sso.service';

import { RolesController } from './controllers/roles.controller';
import { SessionsController } from './controllers/sessions.controller';
import { MFAController } from './controllers/mfa.controller';
import { APIKeyController } from './controllers/api-key.controller';
import { SSOController } from './controllers/sso.controller';

import { LoginSessionService } from '../auth-users/login-session.service';
import { UserLoginSessionRepository } from '../../repository/user-login-session.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RoleEntity,
            PermissionEntity,
            AuthUsersEntity,
            MFASettingsEntity,
            APIKeyEntity,
            SSOProviderEntity
        ])
    ],
    providers: [
        RolesService,
        PermissionsService,
        MFAService,
        APIKeyService,
        SSOService,
        LoginSessionService,
        UserLoginSessionRepository
    ],
    controllers: [
        RolesController,
        SessionsController,
        MFAController,
        APIKeyController,
        SSOController
    ],
    exports: [RolesService, PermissionsService, MFAService, APIKeyService, SSOService]
})
export class IAMModule implements OnModuleInit {
    constructor(private readonly permissionsService: PermissionsService) { }

    async onModuleInit() {
        await this.permissionsService.seedPermissions();
    }
}
