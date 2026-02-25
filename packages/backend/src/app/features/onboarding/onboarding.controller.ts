import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateWorkflowRequest, CompleteStepRequest, GlobalResponse, OnboardingWorkflowModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) { }

    @Get('active/:companyId')
    async getActiveWorkflows(@Param('companyId') companyId: string): Promise<OnboardingWorkflowModel[]> {
        return this.onboardingService.getActiveWorkflows(Number(companyId));
    }

    @Get('employee/:id')
    async getEmployeeWorkflow(@Param('id') id: string): Promise<OnboardingWorkflowModel | null> {
        return this.onboardingService.getEmployeeWorkflow(Number(id));
    }

    @Post('initialize')
    async initializeWorkflow(@Body() req: CreateWorkflowRequest): Promise<GlobalResponse> {
        await this.onboardingService.initializeWorkflow(req.employeeId, req.companyId, req.type);
        return new GlobalResponse(true, 201, 'Workflow initialized');
    }

    @Post('step/:id/complete')
    async completeStep(@Param('id') id: string, @Request() req: any): Promise<GlobalResponse> {
        const userId = req.user.id;
        return this.onboardingService.completeStep(Number(id), userId);
    }
}
