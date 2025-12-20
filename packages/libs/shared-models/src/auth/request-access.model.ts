
export class RequestAccessModel {
    name: string;
    email: string;
    description?: string;

    constructor(name: string, email: string, description?: string) {
        this.name = name;
        this.email = email;
        this.description = description;
    }
}
