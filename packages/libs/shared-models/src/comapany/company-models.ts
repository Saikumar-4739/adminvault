export class CreateCompanyModel {
    companyName: string;
    location: string;
    estDate: Date;
    email?: string;
    phone?: string;
    constructor(companyName: string, location: string, estDate: Date, email?: string, phone?: string) {
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
        this.email = email;
        this.phone = phone;
    }
}


export class UpdateCompanyModel extends CreateCompanyModel {
    id: number;
    constructor(id: number, companyName: string, location: string, estDate: Date, email?: string, phone?: string) {
        super(companyName, location, estDate, email, phone);
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

export class CompanyDocs {
    id: number;
    companyName: string;
    location: string;
    estDate: Date;
    email?: string;
    phone?: string;
    constructor(
        id: number,
        companyName: string,
        location: string,
        estDate: Date,
        email?: string,
        phone?: string
    ) {
        this.id = id;
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
        this.email = email;
        this.phone = phone;
    }
}
