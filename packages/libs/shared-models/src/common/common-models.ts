import { IsNumber, IsNotEmpty } from 'class-validator';

export class IdRequestModel {
    @IsNumber()
    @IsNotEmpty()
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class CompanyIdRequestModel {
    @IsNumber()
    @IsNotEmpty()
    companyId: number;
    constructor(companyId: number) {
        this.companyId = companyId;
    }
}

export class UserIdRequestModel {
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    constructor(userId: number) {
        this.userId = userId;
    }
}

export class UserIdNumRequestModel {
    @IsNumber()
    @IsNotEmpty()
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}
