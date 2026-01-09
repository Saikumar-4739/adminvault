import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { ApprovalRequestEntity } from './entities/approval-request.entity';
import { ApprovalRequestRepository } from './repositories/approval-request.repository';
import { AssetInfoModule } from '../asset-info/asset-info.module';
import { TicketsModule } from '../tickets/tickets.module';
import { ProcurementModule } from '../procurement/procurement.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ApprovalRequestEntity]), 
        forwardRef(() => AssetInfoModule), 
        forwardRef(() => TicketsModule),
        forwardRef(() => ProcurementModule)
    ],
    controllers: [WorkflowController],
    providers: [WorkflowService, ApprovalRequestRepository],
    exports: [WorkflowService]
})
export class WorkflowModule { }
