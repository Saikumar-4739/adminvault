import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyInfoModule } from './features/masters/company-info/company-info.module';
import { AuthUsersModule } from './features/auth-users/auth-users.module';
import { EmployeesModule } from './features/employees/employees.module';
import { EmailInfoModule } from './features/email-info/email-info.module';
import { DeviceInfoModule } from './features/masters/device-info/device-info.module';
import { ItAdminModule } from './features/masters/it-admin/it-admin.module';
import { TicketsModule } from './features/tickets/tickets.module';
import { AssetInfoModule } from './features/asset-info/asset-info.module';
import { AssetAssignModule } from './features/asset-assign/asset-assign.module';
import { MastersModule } from './features/masters/masters.module';
import { LicensesModule } from './features/licenses/licenses.module';
import { DatabaseModule } from '../database/database.module';
import { EmailAccountsModule } from './features/email-accounts/email-accounts.module';
import { ReportsModule } from './features/reports/reports.module';
import { DashboardModule } from './features/dashboard/dashboard.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    CompanyInfoModule,
    AuthUsersModule,
    EmployeesModule,
    EmailInfoModule,
    DeviceInfoModule,
    ItAdminModule,
    TicketsModule,
    AssetInfoModule,
    AssetAssignModule,
    MastersModule,
    LicensesModule,
    EmailAccountsModule,
    ReportsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
