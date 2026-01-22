import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationsMasterEntity } from './entities/location.entity';
import { LocationRepository } from './repositories/location.repository';

@Module({
    imports: [TypeOrmModule.forFeature([LocationsMasterEntity])],
    controllers: [LocationController],
    providers: [LocationService, LocationRepository],
    exports: [LocationService],
})
export class LocationModule { }
