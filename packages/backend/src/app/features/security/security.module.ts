import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { ThreatEntity } from './entities/threat.entity';
import { SecurityProtocolEntity } from './entities/security-protocol.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ThreatEntity, SecurityProtocolEntity])],
    controllers: [SecurityController],
    providers: [SecurityService],
    exports: [SecurityService]
})
export class SecurityModule { }
