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
import { WorkflowModule } from './features/workflow/workflow.module';
import { AiBotModule } from './features/administration/ai-bot/ai-bot.module';
import { KnowledgeBaseModule } from './features/knowledge-base/knowledge-base.module';
import { ProcurementModule } from './features/procurement/procurement.module';
import configuration from '../config/configuration';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RedisCoreModule } from './core/redis/redis.module';


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
    TicketsModule,
    AssetInfoModule,
    MastersModule,
    LicensesModule,
    ReportsModule,
    DashboardModule,
    DocumentsModule,
    AdministrationModule,
    WorkflowModule,
    AiBotModule,
    KnowledgeBaseModule,
    ProcurementModule,
    RedisCoreModule
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
