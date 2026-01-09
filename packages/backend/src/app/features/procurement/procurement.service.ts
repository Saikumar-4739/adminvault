import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
    CreatePOModel,
    PurchaseOrderModel,
    POItemModel,
    GetAllPOsModel,
    GetPOByIdModel,
    POStatusEnum,
    ApprovalTypeEnum,
    CreateApprovalRequestModel
} from '@adminvault/shared-models';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { WorkflowService } from '../workflow/workflow.service';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { VendorsMasterEntity } from '../masters/entities/vendor.entity';

@Injectable()
export class ProcurementService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(PurchaseOrderEntity)
        private poRepo: Repository<PurchaseOrderEntity>,
        @InjectRepository(PurchaseOrderItemEntity)
        private poItemRepo: Repository<PurchaseOrderItemEntity>,
        @InjectRepository(EmployeesEntity)
        private employeeRepo: Repository<EmployeesEntity>,
        @Inject(forwardRef(() => WorkflowService))
        private workflowService: WorkflowService
    ) { }

    async createPO(reqModel: CreatePOModel, userId: number, userEmail?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            // Find Requester (Employee)
            const employee = await this.employeeRepo.findOne({ where: { email: userEmail } });
            if (!employee) throw new ErrorResponse(0, "Employee profile not found for current user.");

            await transManager.startTransaction();

            const poNumber = `PO-${Date.now()}`; // Simple generation
            const totalAmount = reqModel.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            const po = new PurchaseOrderEntity();
            po.poNumber = poNumber;
            po.vendorId = reqModel.vendorId;
            po.requesterId = employee.id;
            po.orderDate = reqModel.orderDate ? new Date(reqModel.orderDate) : new Date();
            po.expectedDeliveryDate = reqModel.expectedDeliveryDate ? new Date(reqModel.expectedDeliveryDate) : null; // Handle optional
            po.status = POStatusEnum.PENDING_APPROVAL; // Default to Pending Approval
            po.totalAmount = totalAmount;
            po.notes = reqModel.notes;
            po.items = reqModel.items.map(i => {
                const item = new PurchaseOrderItemEntity();
                item.itemName = i.itemName;
                item.quantity = i.quantity;
                item.unitPrice = i.unitPrice;
                item.totalPrice = i.quantity * i.unitPrice;
                item.sku = i.sku;
                item.assetTypeId = i.assetTypeId;
                return item;
            });
            po.timeSpentMinutes = reqModel.timeSpentMinutes || 0;

            const savedPO = await transManager.getRepository(PurchaseOrderEntity).save(po);
            await transManager.completeTransaction();

            // Trigger Workflow
            const approvalReq = new CreateApprovalRequestModel(
                ApprovalTypeEnum.PURCHASE_ORDER,
                Number(savedPO.id),
                Number(employee.id),
                Number(employee.companyId),
                `Purchase Order Approval: ${savedPO.poNumber} (${savedPO.totalAmount})`
            );
            await this.workflowService.initiateApproval(approvalReq);

            return new GlobalResponse(true, 0, "Purchase Order created and submitted for approval");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAllPOs(companyId: number): Promise<GetAllPOsModel> {
        try {
            // Assuming POs are linked to company via requester or vendor?
            // PO Entity doesn't have companyId directly, but Requester/Vendor does.
            // Let's filter by requester.companyId matching.
            const pos = await this.poRepo.createQueryBuilder('po')
                .leftJoinAndSelect('po.vendor', 'vendor')
                .leftJoinAndSelect('po.requester', 'requester')
                .leftJoinAndSelect('po.items', 'items')
                .where('requester.companyId = :companyId', { companyId })
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

            return new GetAllPOsModel(true, 0, "POs retrieved", responses);
        } catch (error) {
            throw error;
        }
    }

    async getPO(id: number): Promise<GetPOByIdModel> {
        try {
            const p = await this.poRepo.findOne({
                where: { id },
                relations: ['vendor', 'requester', 'items']
            });

            if (!p) throw new ErrorResponse(0, "PO not found");

            const response = new PurchaseOrderModel(
                p.id, p.poNumber, p.vendorId, p.requesterId, p.orderDate, p.status, p.totalAmount, p.createdAt,
                p.items.map(i => new POItemModel(i.itemName, i.quantity, i.unitPrice, i.sku, i.assetTypeId)),
                p.vendor?.name,
                p.requester ? `${p.requester.firstName} ${p.requester.lastName}` : null,
                p.expectedDeliveryDate,
                p.notes,
                p.timeSpentMinutes
            );

            return new GetPOByIdModel(true, 0, "PO retrieved", response);
        } catch (error) {
            throw error;
        }
    }

    // Callbacks from Workflow Service (need to implement these methods in WorkflowService to call specific services based on Type)
    // Or WorkflowService calls a generic interface? 
    // Usually WorkflowService handles status updates on the ApprovalRequest entity, 
    // BUT the business entity (PO) status also needs to update.
    // I need to expose methods: approvePO, rejectPO that WorkflowService can call, or I call them manually for now.
    // Ideally WorkflowService should emit an event or call a registered handler.
    // For simplicity, I'll add methods here that can be called.

    async updatePOStatus(id: number, status: POStatusEnum): Promise<void> {
        await this.poRepo.update(id, { status });
    }
}
