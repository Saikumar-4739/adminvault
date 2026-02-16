import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemoteService } from './remote.service';
import { RemoteController } from './remote.controller';
import { RemoteMasterEntity } from './entities/remote.entity';
import { RemoteRepository } from './repositories/remote.repository';

@Module({
    imports: [TypeOrmModule.forFeature([RemoteMasterEntity])],
    controllers: [RemoteController],
    providers: [RemoteService, RemoteRepository],
    exports: [RemoteService],
})
export class RemoteModule { }
