import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { ApprovalRequestEntity } from './entities/approval-request.entity';
import { ApprovalRequestRepository } from './repositories/approval-request.repository';
import { AssetInfoModule } from '../asset-info/asset-info.module';
import { TicketsModule } from '../tickets/tickets.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { AdministrationModule } from '../administration/administration.module';
import { EmployeesModule } from '../employees/employees.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { AuthUsersRepository } from '../auth-users/repositories/auth-users.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([ApprovalRequestEntity, AuthUsersEntity]),
        forwardRef(() => AssetInfoModule),
        forwardRef(() => TicketsModule),
        forwardRef(() => ProcurementModule),
        forwardRef(() => AdministrationModule),
        forwardRef(() => EmployeesModule),
        WebSocketModule
    ],
    controllers: [WorkflowController],
    providers: [WorkflowService, ApprovalRequestRepository, AuthUsersRepository],
    exports: [WorkflowService]
})
export class WorkflowModule { }
