import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { ApplicationsMasterEntity } from './entities/application.entity';
import { ApplicationRepository } from './repositories/application.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ApplicationsMasterEntity])],
    controllers: [ApplicationController],
    providers: [ApplicationService, ApplicationRepository],
    exports: [ApplicationService],
})
export class ApplicationModule { }
