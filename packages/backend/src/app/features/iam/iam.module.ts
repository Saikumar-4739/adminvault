import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamController } from './iam.controller';
import { IamService } from './iam.service';
import { RoleMenuEntity } from './entities/role-menu.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RoleMenuEntity, AuthUsersEntity])],
    controllers: [IamController],
    providers: [IamService],
    exports: [IamService],
})
export class IamModule { }
