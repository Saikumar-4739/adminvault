import { ContractStatusEnum } from "../enums/contract-status.enum";

export class CreateContractModel {
    vendorId!: number;
    contractNumber!: string;
    startDate!: Date;
    endDate!: Date;
    totalValue!: number;
    currency!: string;
    renewalAlertDays!: number;
    status!: ContractStatusEnum;
    description?: string;
    terms?: string;
    documentUrl?: string;
    constructor(
        vendorId: number,
        contractNumber: string,
        startDate: Date,
        endDate: Date,
        totalValue: number,
        currency: string = 'USD',
        renewalAlertDays: number = 30,
        status: ContractStatusEnum = ContractStatusEnum.ACTIVE,
        description?: string,
        terms?: string,
        documentUrl?: string

    ) {
        this.vendorId = vendorId;
        this.contractNumber = contractNumber;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalValue = totalValue;
        this.currency = currency;
        this.renewalAlertDays = renewalAlertDays;
        this.status = status;
        this.description = description;
        this.terms = terms;
        this.documentUrl = documentUrl;
    }
}

export class UpdateContractModel {
    id!: number;
    vendorId?: number;
    contractNumber?: string;
    startDate?: Date;
    endDate?: Date;
    totalValue?: number;
    currency?: string;
    renewalAlertDays?: number;
    status?: ContractStatusEnum;
    description?: string;
    terms?: string;
    documentUrl?: string;
    constructor(
        id: number,
        vendorId?: number,
        contractNumber?: string,
        startDate?: Date,
        endDate?: Date,
        totalValue?: number,
        currency?: string,
        renewalAlertDays?: number,
        status?: ContractStatusEnum,
        description?: string,
        terms?: string,
        documentUrl?: string
    ) {
        this.id = id;
        this.vendorId = vendorId;
        this.contractNumber = contractNumber;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalValue = totalValue;
        this.currency = currency;
        this.renewalAlertDays = renewalAlertDays;
        this.status = status;
        this.description = description;
        this.terms = terms;
        this.documentUrl = documentUrl;
    }
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

    constructor(
        id: number,
        vendorId: number,
        contractNumber: string,
        startDate: string,
        endDate: string,
        totalValue: number,
        currency: string,
        renewalAlertDays: number,
        status: ContractStatusEnum,
        createdAt: string,
        updatedAt: string,
        description?: string,
        terms?: string,
        documentUrl?: string,
        vendor?: { id: number; name: string },
        daysUntilExpiry?: number
    ) {
        this.id = id;
        this.vendorId = vendorId;
        this.contractNumber = contractNumber;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalValue = totalValue;
        this.currency = currency;
        this.renewalAlertDays = renewalAlertDays;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.description = description;
        this.terms = terms;
        this.documentUrl = documentUrl;
        this.vendor = vendor;
        this.daysUntilExpiry = daysUntilExpiry;
    }
}
