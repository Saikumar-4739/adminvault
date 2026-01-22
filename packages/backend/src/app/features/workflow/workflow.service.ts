import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ApprovalRequestRepository } from './repositories/approval-request.repository';
import { CreateApprovalRequestModel, ApprovalActionModel, GlobalResponse, ApprovalStatusEnum, ApprovalTypeEnum, TicketStatusEnum, AssetStatusEnum, POStatusEnum, GetPendingApprovalsRequestModel, GetPendingApprovalsResponseModel, UpdateTicketStatusRequestModel, UpdatePOStatusRequestModel, InitiateApprovalResponseModel, ApproveRequestResponseModel, RejectRequestResponseModel } from '@adminvault/shared-models';
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

    async initiateApproval(req: CreateApprovalRequestModel): Promise<InitiateApprovalResponseModel> {
        try {
            const newRequest = this.approvalRepo.create({
                referenceType: req.referenceType,
                referenceId: req.referenceId,
                requesterId: req.requesterId,
                companyId: req.companyId,
                description: req.description,
                status: ApprovalStatusEnum.PENDING
            });
            await this.approvalRepo.save(newRequest);

            return new InitiateApprovalResponseModel(true, 201, 'Approval request initiated');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to initiate approval request');
        }
    }

    async approveRequest(model: ApprovalActionModel): Promise<ApproveRequestResponseModel> {
        try {
            const request = await this.approvalRepo.findOne({ where: { id: model.requestId } });
            if (!request) throw new ErrorResponse(404, 'Request not found');

            if (request.status !== ApprovalStatusEnum.PENDING) {
                throw new ErrorResponse(400, 'Request is not pending');
            }

            request.status = ApprovalStatusEnum.APPROVED;
            request.actionByUserId = model.actionByUserId;
            request.actionAt = new Date();
            request.remarks = model.remarks;

            await this.approvalRepo.save(request);

            switch (request.referenceType) {
                case ApprovalTypeEnum.TICKET:
                    await this.ticketService.updateStatus(new UpdateTicketStatusRequestModel(request.referenceId, TicketStatusEnum.IN_PROGRESS));
                    break;

                case ApprovalTypeEnum.ASSET_ALLOCATION:
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
                    break;

                case ApprovalTypeEnum.PURCHASE_ORDER:
                    await this.procurementService.updatePOStatus(new UpdatePOStatusRequestModel(request.referenceId, POStatusEnum.APPROVED));
                    break;
            }

            return new ApproveRequestResponseModel(true, 200, 'Request approved');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to approve request');
        }
    }

    async rejectRequest(model: ApprovalActionModel): Promise<RejectRequestResponseModel> {
        try {
            const request = await this.approvalRepo.findOne({ where: { id: model.requestId } });
            if (!request) throw new ErrorResponse(404, 'Request not found');

            request.status = ApprovalStatusEnum.REJECTED;
            request.actionByUserId = model.actionByUserId;
            request.actionAt = new Date();
            request.remarks = model.remarks;

            await this.approvalRepo.save(request);

            if (request.referenceType === ApprovalTypeEnum.ASSET_ALLOCATION) {
                await this.assetService.updateAsset({
                    id: request.referenceId,
                    companyId: request.companyId,
                    assetStatusEnum: AssetStatusEnum.AVAILABLE,
                    assignedToEmployeeId: null,
                    userAssignedDate: null
                } as any);
            } else if (request.referenceType === ApprovalTypeEnum.PURCHASE_ORDER) {
                await this.procurementService.updatePOStatus(new UpdatePOStatusRequestModel(request.referenceId, POStatusEnum.REJECTED));
            }

            return new RejectRequestResponseModel(true, 200, 'Request rejected');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to reject request');
        }
    }

    async getPendingApprovals(reqModel: GetPendingApprovalsRequestModel): Promise<GetPendingApprovalsResponseModel> {
        try {
            const approvals = await this.approvalRepo.find({
                where: {
                    companyId: reqModel.companyId,
                    status: ApprovalStatusEnum.PENDING
                }
            });
            return new GetPendingApprovalsResponseModel(true, 200, 'Pending approvals retrieved successfully', []);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch pending approvals');
        }
    }
}
