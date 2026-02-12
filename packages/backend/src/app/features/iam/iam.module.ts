import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamController } from './iam.controller';
import { IamService } from './iam.service';
import { RoleMenuEntity } from './entities/role-menu.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';

import { SystemMenuEntity } from './entities/system-menu.entity';
import { UserMenuEntity } from './entities/user-menu.entity';

import { RoleEntity } from './entities/role.entity';
import { UserRoleEntity } from './entities/user-role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RoleMenuEntity, AuthUsersEntity, SystemMenuEntity, UserMenuEntity, RoleEntity, UserRoleEntity])],
    controllers: [IamController],
    providers: [IamService],
    exports: [IamService],
})
export class IamModule { }
