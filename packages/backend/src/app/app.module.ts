import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyInfoModule } from './features/masters/company-info/company-info.module';
import { AuthUsersModule } from './features/auth-users/auth-users.module';
import { EmployeesModule } from './features/employees/employees.module';
import { EmailInfoModule } from './features/email-info/email-info.module';
import { DeviceInfoModule } from './features/masters/device-info/device-info.module';
import { TicketsModule } from './features/tickets/tickets.module';
import { AssetInfoModule } from './features/asset-info/asset-info.module';
import { AssetAssignModule } from './features/asset-assign/asset-assign.module';
import { MastersModule } from './features/masters/masters.module';
import { LicensesModule } from './features/licenses/licenses.module';
import { DatabaseModule } from '../database/database.module';
import { EmailAccountsModule } from './features/email-accounts/email-accounts.module';
import { ReportsModule } from './features/reports/reports.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { SlackUsersModule } from './features/slack-users/slack-users.module';
import { DocumentsModule } from './features/documents/documents.module';
import configuration from '../config/configuration';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,
    CompanyInfoModule,
    AuthUsersModule,
    EmployeesModule,
    EmailInfoModule,
    DeviceInfoModule,
    TicketsModule,
    AssetInfoModule,
    AssetAssignModule,
    MastersModule,
    LicensesModule,
    EmailAccountsModule,
    ReportsModule,
    DashboardModule,
    SlackUsersModule,
    DocumentsModule,
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
