import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ApprovalRequestRepository } from './repositories/approval-request.repository';
import { CreateApprovalRequestModel, ApprovalActionModel, GlobalResponse, ApprovalStatusEnum, ApprovalTypeEnum, TicketStatusEnum, AssetStatusEnum, POStatusEnum } from '@adminvault/shared-models';
import { AssetInfoService } from '../asset-info/asset-info.service';
import { TicketsService } from '../tickets/tickets.service';
import { ProcurementService } from '../procurement/procurement.service';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class WorkflowService {
    constructor(
        private approvalRepo: ApprovalRequestRepository,
        @Inject(forwardRef(() => AssetInfoService))
        private assetService: AssetInfoService,
        @Inject(forwardRef(() => TicketsService))
        private ticketService: TicketsService,
        @Inject(forwardRef(() => ProcurementService))
        private procurementService: ProcurementService
    ) { }

    async initiateApproval(req: CreateApprovalRequestModel): Promise<GlobalResponse> {
        const newRequest = this.approvalRepo.create({
            referenceType: req.referenceType,
            referenceId: req.referenceId,
            requesterId: req.requesterId,
            companyId: req.companyId,
            description: req.description,
            status: ApprovalStatusEnum.PENDING
        });
        await this.approvalRepo.save(newRequest);

        // FUTURE: Send email to approvers here

        return new GlobalResponse(true, 201, "Approval request initiated");
    }

    async approveRequest(model: ApprovalActionModel): Promise<GlobalResponse> {
        const request = await this.approvalRepo.findOne({ where: { id: model.requestId } });
        if (!request) throw new ErrorResponse(404, "Request not found");

        if (request.status !== ApprovalStatusEnum.PENDING) {
            throw new ErrorResponse(400, "Request is not pending");
        }

        request.status = ApprovalStatusEnum.APPROVED;
        request.actionByUserId = model.actionByUserId;
        request.actionAt = new Date();
        request.remarks = model.remarks;

        await this.approvalRepo.save(request);

        // Handle Post-Approval Actions based on Type
        switch (request.referenceType) {
            case ApprovalTypeEnum.TICKET:
                // For tickets, approval might mean "Work Authorized".
                // We keep the ticket open but maybe log a comment or change internal status if needed.
                // Currently just acknowledging approval.
                await this.ticketService.updateStatus(request.referenceId, TicketStatusEnum.IN_PROGRESS);
                break;

            case ApprovalTypeEnum.ASSET_ALLOCATION:
                // Asset was in 'PENDING_APPROVAL', now move to 'IN_USE' and confirm assignment
                const asset = await this.assetService.getAsset({ id: request.referenceId });
                if (asset && asset.data) {
                    await this.assetService.updateAsset({
                        id: request.referenceId,
                        companyId: request.companyId,
                        assetStatusEnum: AssetStatusEnum.IN_USE,
                        assignedToEmployeeId: request.requesterId,
                        userAssignedDate: new Date()
                    } as any);
                }
                break;

            case ApprovalTypeEnum.LICENSE_ALLOCATION:
                // TODO: Implement License allocation logic
                break;

            case ApprovalTypeEnum.PURCHASE_ORDER:
                await this.procurementService.updatePOStatus(request.referenceId, POStatusEnum.APPROVED);
                break;
        }

        return new GlobalResponse(true, 200, "Request approved");
    }

    async rejectRequest(model: ApprovalActionModel): Promise<GlobalResponse> {
        const request = await this.approvalRepo.findOne({ where: { id: model.requestId } });
        if (!request) throw new ErrorResponse(404, "Request not found");

        request.status = ApprovalStatusEnum.REJECTED;
        request.actionByUserId = model.actionByUserId;
        request.actionAt = new Date();
        request.remarks = model.remarks;

        await this.approvalRepo.save(request);

        // Handle Rejection Logic
        if (request.referenceType === ApprovalTypeEnum.ASSET_ALLOCATION) {
            // If asset allocation rejected, revert asset to AVAILABLE
            await this.assetService.updateAsset({
                id: request.referenceId,
                companyId: request.companyId,
                assetStatusEnum: AssetStatusEnum.AVAILABLE,
                assignedToEmployeeId: null,
                userAssignedDate: null
            } as any);
        } else if (request.referenceType === ApprovalTypeEnum.PURCHASE_ORDER) {
            await this.procurementService.updatePOStatus(request.referenceId, POStatusEnum.REJECTED);
        }

        return new GlobalResponse(true, 200, "Request rejected");
    }

    async getPendingApprovals(companyId: number): Promise<any> {
        return this.approvalRepo.find({ where: { companyId, status: ApprovalStatusEnum.PENDING } });
    }
}
