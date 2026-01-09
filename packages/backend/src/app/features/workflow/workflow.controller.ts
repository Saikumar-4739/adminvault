import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateApprovalRequestModel, ApprovalActionModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
    constructor(private workflowService: WorkflowService) { }

    @Post('initiate')
    async initiate(@Body() body: CreateApprovalRequestModel) {
        return this.workflowService.initiateApproval(body);
    }

    @Post('approve')
    async approve(@Body() body: ApprovalActionModel) {
        return this.workflowService.approveRequest(body);
    }

    @Post('reject')
    async reject(@Body() body: ApprovalActionModel) {
        return this.workflowService.rejectRequest(body);
    }

    @Get('pending')
    async getPending(@Query('companyId') companyId: number) {
        return this.workflowService.getPendingApprovals(Number(companyId));
    }
}
