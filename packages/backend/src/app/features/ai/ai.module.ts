import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmployeesModule } from '../employees/employees.module';
import { TicketsModule } from '../tickets/tickets.module';
import { AssetInfoModule } from '../asset-info/asset-info.module';
import { MastersModule } from '../masters/masters.module';
import { LicensesModule } from '../licenses/licenses.module';
import { DocumentsModule } from '../documents/documents.module';
import { AdministrationModule } from '../administration/administration.module';

@Module({
    imports: [
        EmployeesModule,
        TicketsModule,
        AssetInfoModule,
        MastersModule,
        LicensesModule,
        DocumentsModule,
        AdministrationModule
    ],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService]
})
export class AiModule { }
