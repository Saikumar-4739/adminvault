import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { ApprovalRequestRepository } from './repositories/approval-request.repository';
import { CreateApprovalRequestModel, ApprovalActionModel, ApprovalStatusEnum, ApprovalTypeEnum, TicketStatusEnum, AssetStatusEnum, POStatusEnum, GetPendingApprovalsRequestModel, GetPendingApprovalsResponseModel, UpdateTicketStatusRequestModel, UpdatePOStatusRequestModel, InitiateApprovalResponseModel, ApproveRequestResponseModel, RejectRequestResponseModel, SendAssetApprovalEmailModel } from '@adminvault/shared-models';
import { AssetInfoService } from '../asset-info/asset-info.service';
import { TicketsService } from '../tickets/tickets.service';
import { ProcurementService } from '../procurement/procurement.service';
import { EmailInfoService } from '../administration/email-info.service';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { AuthUsersRepository } from '../auth-users/repositories/auth-users.repository';
import { ErrorResponse } from '@adminvault/backend-utils';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
import { WebSocketEvent, WebSocketRoomHelper } from '@adminvault/shared-models';

@Injectable()
export class WorkflowService {
    private readonly logger = new Logger(WorkflowService.name);

    constructor(
        private approvalRepo: ApprovalRequestRepository,
        @Inject(forwardRef(() => AssetInfoService))
        private assetService: AssetInfoService,
        @Inject(forwardRef(() => TicketsService))
        private ticketService: TicketsService,
        @Inject(forwardRef(() => ProcurementService))
        private procurementService: ProcurementService,
        @Inject(forwardRef(() => EmailInfoService))
        private emailService: EmailInfoService,
        private employeesRepo: EmployeesRepository,
        private authUsersRepo: AuthUsersRepository,
        private wsGateway: AppWebSocketGateway
    ) { }

    /**
     * Looks up the manager's email for a given auth user ID.
     * Chain: auth_users.id → employees (via employeeId string match) → employees.managerId → manager employee → email
     */
    /**
     * Resolves the manager's email for approval notification.
     * Priority 1: assignedToEmployeeId → direct employees.id lookup → managerId → manager email
     * Priority 2: requesterId → employees (via userId) → managerId → manager email
     */
    private async resolveManagerEmail(
        requesterId: number,
        assignedToEmployeeId?: number
    ): Promise<{ email: string; name: string } | null> {
        try {
            let employeeRecord: any = null;

            if (assignedToEmployeeId) {
                // Fast path: we have the employees.id of the user being assigned the asset
                employeeRecord = await this.employeesRepo.findOne({ where: { id: assignedToEmployeeId } });
                if (!employeeRecord) {
                    this.logger.warn(`No employee record for assignedToEmployeeId=${assignedToEmployeeId}`);
                }
            }

            if (!employeeRecord) {
                // Fallback: resolve via auth_user → employees.userId
                employeeRecord = await this.employeesRepo.findOne({ where: { userId: requesterId } });
                if (!employeeRecord) {
                    this.logger.warn(`No employee record for userId=${requesterId}`);
                    return null;
                }
            }

            if (!employeeRecord.managerId) {
                this.logger.warn(`Employee id=${employeeRecord.id} has no managerId set`);
                return null;
            }

            const managerEmployee = await this.employeesRepo.findOne({ where: { id: employeeRecord.managerId } });
            if (!managerEmployee || !managerEmployee.email) {
                this.logger.warn(`No manager employee for managerId=${employeeRecord.managerId}`);
                return null;
            }

            const managerName = `${managerEmployee.firstName} ${managerEmployee.lastName}`.trim();
            this.logger.log(`Manager resolved: ${managerName} <${managerEmployee.email}>`);
            return { email: managerEmployee.email, name: managerName };
        } catch (err) {
            this.logger.error('Failed to resolve manager email', err);
            return null;
        }
    }

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
            this.logger.log(`[Approval] Request saved. requesterId=${req.requesterId}, assignedToEmployeeId=${req.assignedToEmployeeId}, refId=${req.referenceId}`);

            // Await so errors appear in logs immediately
            await this.sendManagerNotification(req);

            // Emit WebSocket event for real-time update
            this.wsGateway.server
                .to(WebSocketRoomHelper.getCompanyRoom(req.companyId))
                .emit(WebSocketEvent.APPROVAL_PENDING, {
                    approvalId: newRequest.id,
                    referenceType: req.referenceType,
                    referenceId: req.referenceId,
                    companyId: req.companyId,
                    timestamp: new Date()
                });

            return new InitiateApprovalResponseModel(true, 201, 'Approval request initiated');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to initiate approval request');
        }
    }

    private async sendManagerNotification(req: CreateApprovalRequestModel): Promise<void> {
        try {
            this.logger.log(`[Email] sendManagerNotification start. assignedToEmployeeId=${req.assignedToEmployeeId}, requesterId=${req.requesterId}, managerEmail=${req.managerEmail}`);

            let managerEmail = req.managerEmail;
            let managerName = 'Manager';

            if (!managerEmail) {
                const resolved = await this.resolveManagerEmail(req.requesterId, req.assignedToEmployeeId);
                if (resolved) {
                    managerEmail = resolved.email;
                    managerName = resolved.name;
                    this.logger.log(`[Email] Manager resolved: ${managerName} <${managerEmail}>`);
                } else {
                    this.logger.warn(`[Email] Could not resolve manager for requesterId=${req.requesterId}, assignedToEmployeeId=${req.assignedToEmployeeId}`);
                }
            }

            if (!managerEmail) {
                this.logger.warn(`[Email] No manager email found — approval request saved but no email sent.`);
                return;
            }

            const description = req.description || `New ${req.referenceType} approval request (Ref #${req.referenceId})`;
            this.logger.log(`[Email] Sending approval email to: ${managerEmail}, message: "${description}"`);

            const emailModel = new SendAssetApprovalEmailModel(
                managerEmail,
                req.companyId,
                req.requesterName || 'A team member',
                description,
                null
            );

            const emailSent = await this.emailService.sendAssetApprovalEmail(emailModel);
            if (emailSent) {
                this.logger.log(`[Email] ✅ Approval email sent successfully to ${managerName} <${managerEmail}>`);
            } else {
                this.logger.error(`[Email] ❌ sendAssetApprovalEmail returned false — check EMAIL_USER / EMAIL_PASS env vars`);
            }
        } catch (err) {
            this.logger.error('[Email] sendManagerNotification threw an exception', err);
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

            // Emit WebSocket event for real-time update
            this.wsGateway.server
                .to(WebSocketRoomHelper.getCompanyRoom(request.companyId))
                .emit(WebSocketEvent.APPROVAL_APPROVED, {
                    approvalId: request.id,
                    referenceType: request.referenceType,
                    referenceId: request.referenceId,
                    companyId: request.companyId,
                    timestamp: new Date()
                });

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

            // Emit WebSocket event for real-time update
            this.wsGateway.server
                .to(WebSocketRoomHelper.getCompanyRoom(request.companyId))
                .emit(WebSocketEvent.APPROVAL_REJECTED, {
                    approvalId: request.id,
                    referenceType: request.referenceType,
                    referenceId: request.referenceId,
                    companyId: request.companyId,
                    timestamp: new Date()
                });

            return new RejectRequestResponseModel(true, 200, 'Request rejected');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to reject request');
        }
    }

    async getPendingApprovals(reqModel: GetPendingApprovalsRequestModel): Promise<GetPendingApprovalsResponseModel> {
        try {
            const approvals = await this.approvalRepo.createQueryBuilder('request')
                .leftJoin('employees', 'emp', 'request.requesterId = emp.id')
                .leftJoin('employees', 'mgr', 'emp.manager_id = mgr.id')
                .select([
                    'request.id as id',
                    'request.referenceType as "referenceType"',
                    'request.referenceId as "referenceId"',
                    'request.status as status',
                    'request.createdAt as "createdAt"',
                    'request.description as description',
                    'request.requesterId as "requesterId"'
                ])
                .addSelect('CONCAT(emp.first_name, \' \', emp.last_name)', 'requesterName')
                .addSelect('CONCAT(mgr.first_name, \' \', mgr.last_name)', 'managerName')
                .where('request.companyId = :companyId', { companyId: reqModel.companyId })
                .andWhere('request.status = :status', { status: ApprovalStatusEnum.PENDING })
                .orderBy('request.createdAt', 'DESC')
                .getRawMany();

            return new GetPendingApprovalsResponseModel(true, 200, 'Pending approvals retrieved successfully', approvals as any);
        } catch (error) {
            this.logger.error('Failed to fetch pending approvals', error);
            throw new ErrorResponse(500, 'Failed to fetch pending approvals');
        }
    }
}
