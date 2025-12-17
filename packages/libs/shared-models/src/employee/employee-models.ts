import { GlobalResponse } from '@adminvault/backend-utils';
import { EmployeeStatusEnum, DepartmentEnum } from '../enums';

export class CreateEmployeeModel {
    companyId: number;
    firstName: string;
    lastName: string;
    email: string;
    phNumber?: string;
    empStatus: EmployeeStatusEnum;
    billingAmount?: number;
    department: DepartmentEnum;
    remarks?: string;

    constructor(
        companyId: number,
        firstName: string,
        lastName: string,
        email: string,
        department: DepartmentEnum,
        empStatus: EmployeeStatusEnum = EmployeeStatusEnum.ACTIVE,
        phNumber?: string,
        billingAmount?: number,
        remarks?: string
    ) {
        this.companyId = companyId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.empStatus = empStatus;
        this.phNumber = phNumber;
        this.billingAmount = billingAmount;
        this.remarks = remarks;
    }
}

export class UpdateEmployeeModel extends CreateEmployeeModel {
    id: number;

    constructor(
        id: number,
        companyId: number,
        firstName: string,
        lastName: string,
        email: string,
        department: DepartmentEnum,
        empStatus: EmployeeStatusEnum = EmployeeStatusEnum.ACTIVE,
        phNumber?: string,
        billingAmount?: number,
        remarks?: string
    ) {
        super(companyId, firstName, lastName, email, department, empStatus, phNumber, billingAmount, remarks);
        this.id = id;
    }
}

export class DeleteEmployeeModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class GetEmployeeModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class EmployeeResponseModel {
    id: number;
    companyId: number;
    firstName: string;
    lastName: string;
    email: string;
    phNumber?: string;
    empStatus: EmployeeStatusEnum;
    billingAmount?: number;
    department: DepartmentEnum;
    remarks?: string;

    constructor(
        id: number,
        companyId: number,
        firstName: string,
        lastName: string,
        email: string,
        department: DepartmentEnum,
        empStatus: EmployeeStatusEnum,
        phNumber?: string,
        billingAmount?: number,
        remarks?: string
    ) {
        this.id = id;
        this.companyId = companyId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.empStatus = empStatus;
        this.phNumber = phNumber;
        this.billingAmount = billingAmount;
        this.remarks = remarks;
    }
}

export class GetAllEmployeesModel extends GlobalResponse {
    employees: EmployeeResponseModel[];

    constructor(status: boolean, code: number, message: string, employees: EmployeeResponseModel[]) {
        super(status, code, message);
        this.employees = employees;
    }
}

export class GetEmployeeByIdModel extends GlobalResponse {
    employee: EmployeeResponseModel;

    constructor(status: boolean, code: number, message: string, employee: EmployeeResponseModel) {
        super(status, code, message);
        this.employee = employee;
    }
}
