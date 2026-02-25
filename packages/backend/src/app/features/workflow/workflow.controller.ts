import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { CreateApprovalRequestModel, ApprovalActionModel, GetPendingApprovalsRequestModel, GetPendingApprovalsResponseModel, InitiateApprovalResponseModel, ApproveRequestResponseModel, RejectRequestResponseModel } from '@adminvault/shared-models';
import { returnException } from '@adminvault/backend-utils';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Workflow')
@Controller('workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
    constructor(private workflowService: WorkflowService) { }

    @Post('initiate')
    @ApiBody({ type: CreateApprovalRequestModel })
    async initiate(@Body() reqModel: CreateApprovalRequestModel): Promise<InitiateApprovalResponseModel> {
        try {
            return await this.workflowService.initiateApproval(reqModel);
        } catch (error) {
            return returnException(InitiateApprovalResponseModel, error);
        }
    }

    @Post('approve')
    @ApiBody({ type: ApprovalActionModel })
    async approve(@Body() reqModel: ApprovalActionModel): Promise<ApproveRequestResponseModel> {
        try {
            return await this.workflowService.approveRequest(reqModel);
        } catch (error) {
            return returnException(ApproveRequestResponseModel, error);
        }
    }

    @Post('reject')
    @ApiBody({ type: ApprovalActionModel })
    async reject(@Body() reqModel: ApprovalActionModel): Promise<RejectRequestResponseModel> {
        try {
            return await this.workflowService.rejectRequest(reqModel);
        } catch (error) {
            return returnException(RejectRequestResponseModel, error);
        }
    }

    @Post('pending')
    @ApiBody({ type: GetPendingApprovalsRequestModel })
    async getPending(@Body() reqModel: GetPendingApprovalsRequestModel): Promise<GetPendingApprovalsResponseModel> {
        try {
            return await this.workflowService.getPendingApprovals(reqModel);
        } catch (error) {
            return returnException(GetPendingApprovalsResponseModel, error);
        }
    }

    @Post('history')
    @ApiBody({ type: GetPendingApprovalsRequestModel })
    async getHistory(@Body() reqModel: GetPendingApprovalsRequestModel): Promise<GetPendingApprovalsResponseModel> {
        try {
            return await this.workflowService.getApprovalHistory(reqModel);
        } catch (error) {
            return returnException(GetPendingApprovalsResponseModel, error);
        }
    }
}
