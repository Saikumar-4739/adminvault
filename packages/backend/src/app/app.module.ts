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
import { AiBotModule } from './features/administration/ai-bot/ai-bot.module';
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
import { RoleMenuEntity } from './features/iam/entities/role-menu.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}', RoleMenuEntity],
        synchronize: true, // Auto-create tables (dev only)
      }),
    }),
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
