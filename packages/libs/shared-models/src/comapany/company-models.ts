export class CreateCompanyModel {
    companyName: string;
    location: string;
    estDate: Date;
    constructor(companyName: string, location: string, estDate: Date) {
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
    }
}


export class UpdateCompanyModel extends CreateCompanyModel {
    id: number;
    constructor(id: number, companyName: string, location: string, estDate: Date) {
        super(companyName, location, estDate);
        this.id = id;
    }
}

export class DeleteCompanyModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class GetCompanyModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}
