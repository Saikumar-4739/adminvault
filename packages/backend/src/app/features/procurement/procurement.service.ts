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
import { VendorsMasterEntity } from '../masters/vendor/entities/vendor.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
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
            po.approverId = data.approverId || null;
            po.userId = userId || 0;
            po.companyId = employee.companyId || 0;
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
                `Purchase Order Approval: ${savedPO.poNumber} (${savedPO.totalAmount})`,
                undefined,
                `${employee.firstName} ${employee.lastName}`,
                savedPO.approverId || undefined
            );
            await this.workflowService.initiateApproval(approvalReq);

            return new GlobalResponse(true, 201, 'Purchase Order created and submitted for approval');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, error.message || 'Failed to create Purchase Order');
        }
    }

    async updatePO(id: number, data: CreatePOModel, userId?: number, userEmail?: string, ipAddress?: string): Promise<GlobalResponse> {
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

            const repo = this.poRepo;
            const existingPO = await repo.findOne({ where: { id: id } });
            if (!existingPO) {
                throw new ErrorResponse(404, 'Purchase Order not found');
            }

            // Only allow updates if not already approved/rejected/etc (optional logic, skipping strict checks for now to allow full edits)

            await transManager.startTransaction();
            const transRepo = transManager.getRepository(PurchaseOrderEntity);
            const itemRepo = transManager.getRepository(PurchaseOrderItemEntity);

            const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            existingPO.vendorId = data.vendorId;
            existingPO.approverId = data.approverId || existingPO.approverId;
            existingPO.orderDate = data.orderDate ? new Date(data.orderDate) : existingPO.orderDate;
            existingPO.expectedDeliveryDate = data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null;
            existingPO.totalAmount = totalAmount;
            existingPO.notes = data.notes;
            existingPO.timeSpentMinutes = data.timeSpentMinutes || existingPO.timeSpentMinutes;

            await transRepo.save(existingPO);

            // Replace items entirely
            await itemRepo.delete({ purchaseOrderId: existingPO.id });

            const itemEntities = data.items.map(i => {
                const item = new PurchaseOrderItemEntity();
                item.purchaseOrderId = existingPO.id;
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

            return new GlobalResponse(true, 200, 'Purchase Order updated successfully');

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

            // Fetch auth users (requesters)
            const userIdsToFetch = [...new Set(pos.map(p => Number(p.userId)))].filter(id => !isNaN(id) && id > 0);
            const authUsers = await this.dataSource.getRepository(AuthUsersEntity).find({ where: { id: In(userIdsToFetch) } });
            const userMap = new Map<number, string>();
            authUsers.forEach(u => userMap.set(Number(u.id), u.fullName));

            // Fetch employees (approvers)
            const employeeIdsToFetch = [...new Set([
                ...pos.map(p => Number(p.requesterId)), // fallback
                ...pos.filter(p => p.approverId).map(p => Number(p.approverId))
            ])].filter(id => !isNaN(id));
            const employees = await this.dataSource.getRepository(EmployeesEntity).find({ where: { id: In(employeeIdsToFetch) } });
            const employeeMap = new Map<number, string>();
            employees.forEach(e => employeeMap.set(Number(e.id), `${e.firstName} ${e.lastName}`));

            // Fetch vendors
            const vendorIds = [...new Set(pos.map(p => Number(p.vendorId)))];
            const vendors = await this.dataSource.getRepository(VendorsMasterEntity).find({ where: { id: In(vendorIds) } });
            const vendorMap = new Map<number, string>();
            vendors.forEach(v => vendorMap.set(Number(v.id), v.name));

            const responses = pos.map(p => new PurchaseOrderModel(
                p.id, p.poNumber, p.vendorId, p.requesterId, p.orderDate, p.status, p.totalAmount, p.createdAt,
                (itemsByPo.get(Number(p.id)) || []).map(i => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                vendorMap.get(Number(p.vendorId)) || undefined, // vendor name mapped
                userMap.get(Number(p.userId)) || employeeMap.get(Number(p.requesterId)) || null,
                p.expectedDeliveryDate,
                p.notes,
                p.timeSpentMinutes,
                p.approverId || undefined,
                p.approverId ? employeeMap.get(Number(p.approverId)) || undefined : undefined
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

            // Fetch requester name separately combining user and employee fallback
            let requesterName: string | null = null;
            if (p.userId) {
                const user = await this.dataSource.getRepository(AuthUsersEntity).findOne({ where: { id: p.userId } });
                if (user) requesterName = user.fullName;
            }
            if (!requesterName && p.requesterId) {
                const requester = await this.dataSource.getRepository(EmployeesEntity).findOne({ where: { id: p.requesterId } });
                if (requester) requesterName = `${requester.firstName} ${requester.lastName}`;
            }

            // Fetch approver name separately
            let approverName: string | undefined = undefined;
            if (p.approverId) {
                const approver = await this.dataSource.getRepository(EmployeesEntity).findOne({ where: { id: p.approverId } });
                if (approver) approverName = `${approver.firstName} ${approver.lastName}`;
            }

            // Fetch vendor name separately
            let vendorName: string | undefined = undefined;
            if (p.vendorId) {
                const vendor = await this.dataSource.getRepository(VendorsMasterEntity).findOne({ where: { id: p.vendorId } });
                if (vendor) vendorName = vendor.name;
            }

            const response = new PurchaseOrderModel(
                p.id, p.poNumber, p.vendorId, p.requesterId, p.orderDate, p.status, p.totalAmount, p.createdAt,
                items.map(i => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                vendorName, // vendor name mapped
                requesterName,
                p.expectedDeliveryDate,
                p.notes,
                p.timeSpentMinutes,
                p.approverId || undefined,
                approverName
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
