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
import { DepartmentEntity } from '../app/entities/masters/department.entity';
import { AssetTypeEntity } from '../app/entities/masters/asset-type.entity';
import { BrandEntity } from '../app/entities/masters/brand.entity';
import { VendorEntity } from '../app/entities/masters/vendor.entity';
import { LocationEntity } from '../app/entities/masters/location.entity';
import { TicketCategoryEntity } from '../app/entities/masters/ticket-category.entity';
import { UserLoginSessionEntity } from '../app/entities/user-login-sessions.entity';

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
                    DepartmentEntity,
                    AssetTypeEntity,
                    BrandEntity,
                    VendorEntity,
                    LocationEntity,
                    TicketCategoryEntity,
                    UserLoginSessionEntity
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
