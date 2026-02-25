import { ContractStatusEnum } from "../enums/contract-status.enum";

export class CreateContractModel {
    constructor(
        public vendorId: number,
        public contractNumber: string,
        public startDate: Date,
        public endDate: Date,
        public totalValue: number,
        public currency: string = 'USD',
        public renewalAlertDays: number = 30,
        public status: ContractStatusEnum = ContractStatusEnum.ACTIVE,
        public description?: string,
        public terms?: string,
        public documentUrl?: string
    ) { }
}

export class UpdateContractModel {
    constructor(
        public id: number,
        public vendorId?: number,
        public contractNumber?: string,
        public startDate?: Date,
        public endDate?: Date,
        public totalValue?: number,
        public currency?: string,
        public renewalAlertDays?: number,
        public status?: ContractStatusEnum,
        public description?: string,
        public terms?: string,
        public documentUrl?: string
    ) { }
}

export class ContractResponseModel {
    id!: number;
    vendorId!: number;
    contractNumber!: string;
    startDate!: string;
    endDate!: string;
    totalValue!: number;
    currency!: string;
    renewalAlertDays!: number;
    status!: ContractStatusEnum;
    description?: string;
    terms?: string;
    documentUrl?: string;
    vendor?: {
        id: number;
        name: string;
    };
    daysUntilExpiry?: number;
    createdAt!: string;
    updatedAt!: string;
}
