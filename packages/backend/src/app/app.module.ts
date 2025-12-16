import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '../database/database.module';
import { CompanyInfoModule } from './features/company-info/company-info.module';
import { AuthUsersModule } from './features/auth-users/auth-users.module';
import { EmployeesModule } from './features/employees/employees.module';
import { EmailInfoModule } from './features/email-info/email-info.module';
import { DeviceInfoModule } from './features/device-info/device-info.module';
import { ItAdminModule } from './features/it-admin/it-admin.module';
import { TicketsModule } from './features/tickets/tickets.module';
import { AssetInfoModule } from './features/asset-info/asset-info.module';
import { AssetAssignModule } from './features/asset-assign/asset-assign.module';
import { TicketCommentsModule } from './features/ticket-comments/ticket-comments.module';
import { TicketStatusLogsModule } from './features/ticket-status-logs/ticket-status-logs.module';
import { EmailAccountsModule } from './features/email-accounts/email-accounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'dist/backend/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    DatabaseModule,
    // CompanyInfoModule,
    AuthUsersModule,
    // EmployeesModule,
    // EmailInfoModule,
    // DeviceInfoModule,
    // ItAdminModule,
    // TicketsModule,
    // AssetInfoModule,
    // AssetAssignModule,
    // TicketCommentsModule,
    // TicketStatusLogsModule,
    // EmailAccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
