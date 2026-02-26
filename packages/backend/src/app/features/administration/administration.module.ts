import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from './email.controller';
import { EmailInfoService } from './email-info.service';
import { EmailInfoEntity } from './entities/email-info.entity';
import { AccessRequestEntity } from './entities/access-request.entity';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { AssetAssignEntity } from '../asset-info/entities/asset-assign.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { AccessRequestRepository } from './repositories/access-request.repository';
import { AuthUsersModule } from '../auth-users/auth-users.module';
import { EmployeesRepository } from '../employees/repositories/employees.repository';

@Module({
    imports: [TypeOrmModule.forFeature([AssetInfoEntity, AssetAssignEntity, AuthUsersEntity, EmailInfoEntity, AccessRequestEntity, EmployeesEntity]), forwardRef(() => AuthUsersModule)],
    controllers: [EmailController],
    providers: [EmailInfoService, EmailInfoRepository, AccessRequestRepository, EmployeesRepository],
    exports: [EmailInfoService, AccessRequestRepository]
})
export class AdministrationModule { }
