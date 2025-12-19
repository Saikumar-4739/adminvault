export class CreateCompanyModel {
    companyName: string;
    location: string;
    estDate: Date;
    email?: string | null;
    phone?: string | null;
    constructor(companyName: string, location: string, estDate: Date, email?: string | null, phone?: string | null) {
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
        this.email = email;
        this.phone = phone;
    }
}


export class UpdateCompanyModel extends CreateCompanyModel {
    id: number;
    constructor(id: number, companyName: string, location: string, estDate: Date, email?: string | null, phone?: string | null) {
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
    email?: string | null;
    phone?: string | null;
    constructor(
        id: number,
        companyName: string,
        location: string,
        estDate: Date,
        email?: string | null,
        phone?: string | null
    ) {
        this.id = id;
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
        this.email = email;
        this.phone = phone;
    }
}
