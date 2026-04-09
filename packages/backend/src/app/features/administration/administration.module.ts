import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { AssetAssignEntity } from '../asset-info/entities/asset-assign.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { AuthUsersModule } from '../auth-users/auth-users.module';
import { EmployeesRepository } from '../employees/repositories/employees.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AssetInfoEntity, AssetAssignEntity, AuthUsersEntity, EmployeesEntity]), forwardRef(() => AuthUsersModule)],
    controllers: [],
    providers: [EmployeesRepository],
    exports: []
})
export class AdministrationModule { }
