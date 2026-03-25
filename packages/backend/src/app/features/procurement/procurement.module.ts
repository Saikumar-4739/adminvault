import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { VendorsMasterEntity } from '../masters/vendor/entities/vendor.entity';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';
import { PurchaseOrderItemRepository } from './repositories/purchase-order-item.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdministrationModule } from '../administration/administration.module';
import { VendorRepository } from '../masters/vendor/repositories/vendor.repository';

@Module({
    imports: [TypeOrmModule.forFeature([PurchaseOrderEntity, PurchaseOrderItemEntity, EmployeesEntity, VendorsMasterEntity]), NotificationsModule, forwardRef(() => AdministrationModule)],
    controllers: [ProcurementController],
    providers: [ProcurementService, PurchaseOrderRepository, PurchaseOrderItemRepository, EmployeesRepository, VendorRepository],
    exports: [ProcurementService]
})
export class ProcurementModule { }
