import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceHealthController } from './device-health.controller';
import { DeviceHealthService } from './device-health.service';
import { DeviceHealthEntity } from './entities/device-health.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DeviceHealthEntity])],
    controllers: [DeviceHealthController],
    providers: [DeviceHealthService],
    exports: [DeviceHealthService]
})
export class DeviceHealthModule { }
