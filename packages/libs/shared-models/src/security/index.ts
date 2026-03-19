import { ThreatGravityEnum } from '../enums/threat-gravity.enum';

export class Threat {
    id: number;
    type: string;
    source: string;
    status: string;
    gravity: ThreatGravityEnum;
    time: string;
    companyId: number;
    createdAt?: Date;

    constructor(id: number, type: string, source: string, status: string, gravity: ThreatGravityEnum, time: string, companyId: number) {
        this.id = id;
        this.type = type;
        this.source = source;
        this.status = status;
        this.gravity = gravity;
        this.time = time;
        this.companyId = companyId;
    }
}

export class SecurityProtocol {
    id: number;
    name: string;
    description: string;
    status: string;
    companyId: number;

    constructor(id: number, name: string, description: string, status: string, companyId: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.companyId = companyId;
    }
}
