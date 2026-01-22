import { Module } from '@nestjs/common';
import { AiBotController } from './ai-bot.controller';
import { AiBotService } from './ai-bot.service';
import { EmployeesModule } from '../../employees/employees.module';
import { TicketsModule } from '../../tickets/tickets.module';
import { AssetInfoModule } from '../../asset-info/asset-info.module';
import { MastersModule } from '../../masters/masters.module';
import { LicensesModule } from '../../licenses/licenses.module';
import { DocumentsModule } from '../../documents/documents.module';
import { AdministrationModule } from '../administration.module';
import { ProcurementModule } from '../../procurement/procurement.module';

@Module({
    imports: [
        EmployeesModule,
        TicketsModule,
        AssetInfoModule,
        MastersModule,
        LicensesModule,
        DocumentsModule,
        AdministrationModule,
        ProcurementModule
    ],
    controllers: [AiBotController],
    providers: [AiBotService],
    exports: [AiBotService]
})
export class AiBotModule { }
