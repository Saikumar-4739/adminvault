import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { VendorsMasterEntity } from '../masters/entities/vendor.entity';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PurchaseOrderEntity,
            PurchaseOrderItemEntity,
            EmployeesEntity,
            VendorsMasterEntity
        ]),
        forwardRef(() => WorkflowModule)
    ],
    controllers: [ProcurementController],
    providers: [ProcurementService],
    exports: [ProcurementService]
})
export class ProcurementModule { }
