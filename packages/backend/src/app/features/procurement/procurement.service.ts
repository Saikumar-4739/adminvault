import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePOModel, PurchaseOrderModel, POItemModel, GetAllPOsModel, GetPOByIdModel, POStatusEnum, ApprovalTypeEnum, CreateApprovalRequestModel, GetAllPOsRequestModel, GetPORequestModel, UpdatePOStatusRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { WorkflowService } from '../workflow/workflow.service';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { PurchaseOrderRepository } from './repositories/purchase-order.repository';
import { PurchaseOrderItemRepository } from './repositories/purchase-order-item.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';

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
            const employee = await this.employeeRepo.findOne({ where: { email: userEmail } });
            if (!employee) {
                throw new ErrorResponse(404, 'Employee profile not found for current user');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(PurchaseOrderEntity);

            const poNumber = `PO-${Date.now()}`;
            const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            const po = repo.create({
                poNumber,
                vendorId: data.vendorId,
                requesterId: employee.id,
                orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
                expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
                status: POStatusEnum.PENDING_APPROVAL,
                totalAmount,
                notes: data.notes,
                timeSpentMinutes: data.timeSpentMinutes || 0,
                items: data.items.map(i => {
                    const item = new PurchaseOrderItemEntity();
                    item.itemName = i.itemName;
                    item.quantity = i.quantity;
                    item.unitPrice = i.unitPrice;
                    item.totalPrice = i.quantity * i.unitPrice;
                    item.sku = i.sku;
                    item.assetTypeId = i.assetTypeId;
                    return item;
                })
            });

            const savedPO = await repo.save(po);
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
            const pos = await this.poRepo.createQueryBuilder('po')
                .leftJoinAndSelect('po.vendor', 'vendor')
                .leftJoinAndSelect('po.requester', 'requester')
                .leftJoinAndSelect('po.items', 'items')
                .where('requester.companyId = :companyId', { companyId: reqModel.companyId })
                .orderBy('po.createdAt', 'DESC')
                .getMany();

            const responses = pos.map(p => new PurchaseOrderModel(
                p.id, p.poNumber, p.vendorId, p.requesterId, p.orderDate, p.status, p.totalAmount, p.createdAt,
                p.items.map(i => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                p.vendor?.name,
                p.requester ? `${p.requester.firstName} ${p.requester.lastName}` : null,
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
            const p = await this.poRepo.findOne({
                where: { id: reqModel.id },
                relations: ['vendor', 'requester', 'items']
            });

            if (!p) {
                throw new ErrorResponse(404, 'Purchase Order not found');
            }

            const response = new PurchaseOrderModel(
                p.id, p.poNumber, p.vendorId, p.requesterId, p.orderDate, p.status, p.totalAmount, p.createdAt,
                p.items.map(i => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                p.vendor?.name,
                p.requester ? `${p.requester.firstName} ${p.requester.lastName}` : null,
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
