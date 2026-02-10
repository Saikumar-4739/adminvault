import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { WorkflowModule } from './features/workflow/workflow.module';
import { KnowledgeBaseModule } from './features/knowledge-base/knowledge-base.module';
import { ProcurementModule } from './features/procurement/procurement.module';
import configuration from '../config/configuration';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebSocketModule } from './features/websocket/websocket.module';
import { NetworkModule } from './features/network/network.module';
import { IamModule } from './features/iam/iam.module';
import { TypeOrmModule } from '@nestjs/typeorm';


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
    WorkflowModule,
    KnowledgeBaseModule,
    ProcurementModule,
    EventEmitterModule.forRoot(),
    WebSocketModule,
    NetworkModule,
    IamModule,
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
