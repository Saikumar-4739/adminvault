export class CreateCompanyModel {
    companyName: string;
    location: string;
    estDate: Date;
    email?: string;
    phone?: string;
    userId?: number;
    constructor(companyName: string, location: string, estDate: Date, email?: string, phone?: string, userId?: number) {
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
        this.email = email;
        this.phone = phone;
        this.userId = userId;
    }
}


export class UpdateCompanyModel extends CreateCompanyModel {
    id: number;
    constructor(id: number, companyName: string, location: string, estDate: Date, email?: string, phone?: string, userId?: number) {
        super(companyName, location, estDate, email, phone, userId);
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
