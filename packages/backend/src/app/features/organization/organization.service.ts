import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingEntity, VendorEntity, InvoiceEntity } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
    constructor(
        @InjectRepository(BillingEntity)
        private billingRepo: Repository<BillingEntity>,
        @InjectRepository(VendorEntity)
        private vendorRepo: Repository<VendorEntity>,
        @InjectRepository(InvoiceEntity)
        private invoiceRepo: Repository<InvoiceEntity>
    ) { }

    async getBilling(companyId: number): Promise<any> {
        try {
            const billing = await this.billingRepo.find({ where: { companyId }, order: { nextBillingDate: 'ASC' } });
            return { success: true, data: billing };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async getVendors(companyId: number): Promise<any> {
        try {
            const vendors = await this.vendorRepo.find({ where: { companyId }, order: { name: 'ASC' } });
            return { success: true, data: vendors };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async createVendor(companyId: number, data: any): Promise<any> {
        const vendor = this.vendorRepo.create({ ...data, companyId });
        await this.vendorRepo.save(vendor);
        return { success: true };
    }

    async getInvoices(companyId: number): Promise<any> {
        try {
            const invoices = await this.invoiceRepo.find({ where: { companyId }, order: { invoiceDate: 'DESC' } });
            return { success: true, data: invoices };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
}
