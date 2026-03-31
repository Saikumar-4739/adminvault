import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyInfoModule } from './features/masters/company-info/company-info.module';
import { AuthUsersModule } from './features/auth-users/auth-users.module';
import { EmployeesModule } from './features/employees/employees.module';
import { TicketsModule } from './features/tickets/tickets.module';
import { AssetInfoModule } from './features/asset-info/asset-info.module';
import { MastersModule } from './features/masters/masters.module';
import { LicensesModule } from './features/licenses/licenses.module';
import { DatabaseModule } from '../database/database.module';
import { ReportsModule } from './features/reports/reports.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { DocumentsModule } from './features/documents/documents.module';
import { AdministrationModule } from './features/administration/administration.module';
import { KnowledgeBaseModule } from './features/knowledge-base/knowledge-base.module';
import { ProcurementModule } from './features/procurement/procurement.module';
import { AuditLogModule } from './features/audit-log/audit-log.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { OnboardingModule } from './features/onboarding/onboarding.module';
import { ContractModule } from './features/contracts/contract.module';
import configuration from '../config/configuration';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebSocketModule } from './features/websocket/websocket.module';
import { NetworkModule } from './features/network/network.module';
import { SecurityModule } from './features/security/security.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'packages/backend/.env'],
      load: [configuration],
    }),
    DatabaseModule,
    CompanyInfoModule,
    AuthUsersModule,
    EmployeesModule,
    TicketsModule,
    AssetInfoModule,
    MastersModule,
    LicensesModule,
    ReportsModule,
    DashboardModule,
    DocumentsModule,
    AdministrationModule,
    KnowledgeBaseModule,
    ProcurementModule,
    AuditLogModule,
    NotificationsModule,
    OnboardingModule,
    ContractModule,
    EventEmitterModule.forRoot(),
    WebSocketModule,
    NetworkModule,
    SecurityModule,
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
