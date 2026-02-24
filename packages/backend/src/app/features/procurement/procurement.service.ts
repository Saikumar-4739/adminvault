import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { CreatePOModel, PurchaseOrderModel, POItemModel, GetAllPOsModel, GetPOByIdModel, POStatusEnum, ApprovalTypeEnum, CreateApprovalRequestModel, GetAllPOsRequestModel, GetPORequestModel, UpdatePOStatusRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { WorkflowService } from '../workflow/workflow.service';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';
import { PurchaseOrderItemRepository } from './repositories/purchase-order-item.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { EmployeesEntity } from '../employees/entities/employees.entity';

@Injectable()
export class ProcurementService {
    constructor(
        private dataSource: DataSource,
        private poRepo: PurchaseOrderRepository,
        private poItemRepo: PurchaseOrderItemRepository,
        private employeeRepo: EmployeesRepository,
        @Inject(forwardRef(() => WorkflowService))
        private workflowService: WorkflowService
    ) { }

    async createPO(data: CreatePOModel, userId?: number, userEmail?: string, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const employee = await this.employeeRepo.findOne({
                where: [
                    { userId: userId },
                    { email: userEmail }
                ]
            });
            if (!employee) {
                throw new ErrorResponse(404, 'Employee profile not found for current user');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(PurchaseOrderEntity);
            const itemRepo = transManager.getRepository(PurchaseOrderItemEntity);

            const poNumber = `PO-${Date.now()}`;
            const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            const po = new PurchaseOrderEntity();
            po.poNumber = poNumber;
            po.vendorId = data.vendorId;
            po.requesterId = employee.id;
            po.orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
            po.expectedDeliveryDate = data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null;
            po.status = POStatusEnum.PENDING_APPROVAL;
            po.totalAmount = totalAmount;
            po.notes = data.notes;
            po.timeSpentMinutes = data.timeSpentMinutes || 0;

            const savedPO = await repo.save(po);

            // Save items separately (no more cascade via relation)
            const itemEntities = data.items.map(i => {
                const item = new PurchaseOrderItemEntity();
                item.purchaseOrderId = savedPO.id;
                item.itemName = i.itemName;
                item.quantity = i.quantity;
                item.unitPrice = i.unitPrice;
                item.totalPrice = i.quantity * i.unitPrice;
                item.sku = i.sku;
                item.assetTypeId = i.assetTypeId;
                return item;
            });
            await itemRepo.save(itemEntities);

            await transManager.completeTransaction();

            const approvalReq = new CreateApprovalRequestModel(
                ApprovalTypeEnum.PURCHASE_ORDER,
                Number(savedPO.id),
                Number(employee.id),
                Number(employee.companyId),
                `Purchase Order Approval: ${savedPO.poNumber} (${savedPO.totalAmount})`
            );
            await this.workflowService.initiateApproval(approvalReq);

            return new GlobalResponse(true, 201, 'Purchase Order created and submitted for approval');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to create Purchase Order');
        }
    }

    async getAllPOs(reqModel: GetAllPOsRequestModel): Promise<GetAllPOsModel> {
        try {
            // Fetch all POs for employees of this company
            const companyEmployees = await this.dataSource.getRepository(EmployeesEntity).find({
                where: { companyId: reqModel.companyId }
            });
            const employeeIds = companyEmployees.map(e => e.id);
            if (employeeIds.length === 0) {
                return new GetAllPOsModel(true, 200, 'Purchase Orders retrieved successfully', []);
            }

            const pos = await this.poRepo.find({
                where: { requesterId: In(employeeIds) },
                order: { createdAt: 'DESC' }
            });

            if (pos.length === 0) {
                return new GetAllPOsModel(true, 200, 'Purchase Orders retrieved successfully', []);
            }

            // Fetch items for all POs
            const poIds = pos.map(p => p.id);
            const allItems = await this.poItemRepo.find({ where: { purchaseOrderId: In(poIds) } });
            const itemsByPo = new Map<number, PurchaseOrderItemEntity[]>();
            allItems.forEach(i => {
                const key = Number(i.purchaseOrderId);
                if (!itemsByPo.has(key)) itemsByPo.set(key, []);
                itemsByPo.get(key).push(i);
            });

            // Fetch employees (requesters)
            const requesterIds = [...new Set(pos.map(p => Number(p.requesterId)))];
            const requesters = await this.dataSource.getRepository(EmployeesEntity).find({ where: { id: In(requesterIds) } });
            const requesterMap = new Map<number, string>();
            requesters.forEach(e => requesterMap.set(Number(e.id), `${e.firstName} ${e.lastName}`));

            const responses = pos.map(p => new PurchaseOrderModel(
                p.id, p.poNumber, p.vendorId, p.requesterId, p.orderDate, p.status, p.totalAmount, p.createdAt,
                (itemsByPo.get(Number(p.id)) || []).map(i => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                undefined, // vendor name — fetched separately if needed
                requesterMap.get(Number(p.requesterId)) || null,
                p.expectedDeliveryDate,
                p.notes,
                p.timeSpentMinutes
            ));

            return new GetAllPOsModel(true, 200, 'Purchase Orders retrieved successfully', responses);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Purchase Orders');
        }
    }

    async getPO(reqModel: GetPORequestModel): Promise<GetPOByIdModel> {
        try {
            const p = await this.poRepo.findOne({ where: { id: reqModel.id } });
            if (!p) {
                throw new ErrorResponse(404, 'Purchase Order not found');
            }

            // Fetch items separately
            const items = await this.poItemRepo.find({ where: { purchaseOrderId: p.id } });

            // Fetch requester name separately
            let requesterName: string | null = null;
            if (p.requesterId) {
                const requester = await this.dataSource.getRepository(EmployeesEntity).findOne({ where: { id: p.requesterId } });
                if (requester) requesterName = `${requester.firstName} ${requester.lastName}`;
            }

            const response = new PurchaseOrderModel(
                p.id, p.poNumber, p.vendorId, p.requesterId, p.orderDate, p.status, p.totalAmount, p.createdAt,
                items.map(i => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                undefined, // vendor name
                requesterName,
                p.expectedDeliveryDate,
                p.notes,
                p.timeSpentMinutes
            );

            return new GetPOByIdModel(true, 200, 'Purchase Order retrieved successfully', response);
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to fetch Purchase Order');
        }
    }

    async updatePOStatus(reqModel: UpdatePOStatusRequestModel): Promise<GlobalResponse> {
        try {
            await this.poRepo.update(reqModel.id, { status: reqModel.status });
            return new GlobalResponse(true, 200, 'Purchase Order status updated successfully');
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to update Purchase Order status');
        }
    }
}
