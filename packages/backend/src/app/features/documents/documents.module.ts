import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentEntity } from '../../entities/document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentRepository } from '../../repository/document.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([DocumentEntity]),
        MulterModule.register({}),
    ],
    controllers: [DocumentsController],
    providers: [DocumentsService, DocumentRepository],
    exports: [DocumentsService],
})
export class DocumentsModule { }
