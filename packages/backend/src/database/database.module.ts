import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthUsersEntity } from '../app/entities/auth-users.entity';
import { CompanyInfoEntity } from '../app/entities/company-info.entity';
import { EmployeesEntity } from '../app/entities/employees.entity';
import { EmailInfoEntity } from '../app/entities/email-info.entity';
import { DeviceInfoEntity } from '../app/entities/device-info.entity';
import { ItAdminEntity } from '../app/entities/it-admin.entity';
import { TicketsEntity } from '../app/entities/tickets.entity';
import { AssetInfoEntity } from '../app/entities/asset-info.entity';
import { AssetAssignEntity } from '../app/entities/asset-assign.entity';
import { TicketCommentsEntity } from '../app/entities/ticket-comments.entity';
import { TicketStatusLogsEntity } from '../app/entities/ticket-status-logs.entity';
import { EmailAccountsEntity } from '../app/entities/email-accounts.entity';
import { DepartmentsMasterEntity } from '../app/entities/masters/department.entity';
import { AssetTypeMasterEntity } from '../app/entities/masters/asset-type.entity';
import { BrandsMasterEntity } from '../app/entities/masters/brand.entity';
import { VendorsMasterEntity } from '../app/entities/masters/vendor.entity';
import { LocationsMasterEntity } from '../app/entities/masters/location.entity';
import { TicketCategoriesMasterEntity } from '../app/entities/masters/ticket-category.entity';
import { ApplicationsMasterEntity } from '../app/entities/masters/application.entity';
import { ExpenseCategoriesMasterEntity } from '../app/entities/masters/expense-category.entity';
import { UserLoginSessionsEntity } from '../app/entities/user-login-sessions.entity';
import { CompanyLicenseEntity } from '../app/entities/company-license.entity';
import { SlackUserEntity } from '../app/entities/slack-user.entity';
import { DocumentEntity } from '../app/entities/document.entity';
import { PasswordVaultMasterEntity } from '../app/entities/masters/password-vault.entity';
import { AssetNextAssignmentEntity } from '../app/entities/asset-next-assignment.entity';
import { AssetReturnHistoryEntity } from '../app/entities/asset-return-history.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 3306),
                username: configService.get<string>('DB_USERNAME', 'root'),
                password: configService.get<string>('DB_PASSWORD', ''),
                database: configService.get<string>('DB_DATABASE', 'adminvault'),
                entities: [
                    AuthUsersEntity,
                    CompanyInfoEntity,
                    EmployeesEntity,
                    EmailInfoEntity,
                    DeviceInfoEntity,
                    ItAdminEntity,
                    TicketsEntity,
                    AssetInfoEntity,
                    AssetAssignEntity,
                    TicketCommentsEntity,
                    TicketStatusLogsEntity,
                    EmailAccountsEntity,
                    DepartmentsMasterEntity,
                    AssetTypeMasterEntity,
                    BrandsMasterEntity,
                    VendorsMasterEntity,
                    LocationsMasterEntity,
                    TicketCategoriesMasterEntity,
                    ApplicationsMasterEntity,
                    ExpenseCategoriesMasterEntity,
                    UserLoginSessionsEntity,
                    CompanyLicenseEntity,
                    SlackUserEntity,
                    DocumentEntity,
                    PasswordVaultMasterEntity,
                    AssetNextAssignmentEntity,
                    AssetReturnHistoryEntity,
                ],
                synchronize: false,
                logging: configService.get<string>('NODE_ENV') !== 'production',
                ssl: configService.get<string>('DB_HOST')?.includes('aivencloud.com')
                    ? { rejectUnauthorized: false }
                    : false,
            }),
        }),
    ],
})
export class DatabaseModule { }
