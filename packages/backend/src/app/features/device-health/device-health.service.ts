import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceHealthEntity } from './entities/device-health.entity';

@Injectable()
export class DeviceHealthService {
    constructor(
        @InjectRepository(DeviceHealthEntity)
        private repository: Repository<DeviceHealthEntity>
    ) { }

    async getDeviceHealthList(companyId: number): Promise<any> {
        try {
            const devices = await this.repository.find({
                where: { companyId },
                order: { lastSync: 'DESC' }
            });
            return {
                success: true,
                data: devices
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async getDeviceStats(companyId: number): Promise<any> {
        try {
            const devices = await this.repository.find({ where: { companyId } });
            return {
                success: true,
                stats: {
                    total: devices.length,
                    healthy: devices.filter(d => d.status === 'Healthy').length,
                    warning: devices.filter(d => d.status === 'Warning').length,
                    critical: devices.filter(d => d.status === 'Critical').length,
                }
            };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    async updateHealth(companyId: number, data: any): Promise<any> {
        // MDM Sync Simulation
        const device = await this.repository.findOne({ where: { assetTag: data.assetTag, companyId } });
        if (device) {
            Object.assign(device, data);
            await this.repository.save(device);
        } else {
            const newDevice = this.repository.create({ ...data, companyId });
            await this.repository.save(newDevice);
        }
        return { success: true };
    }
}
