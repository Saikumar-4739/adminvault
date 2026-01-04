import { GlobalResponse } from '../common/global-response';
import { EmployeeStatusEnum } from '../enums';

export class CreateEmployeeModel {
    companyId: number;
    firstName: string;
    lastName: string;
    email: string;
    phNumber?: string;
    empStatus: EmployeeStatusEnum;
    billingAmount?: number;
    departmentId: number;
    remarks?: string;
    slackUserId?: string;
    slackDisplayName?: string;
    slackAvatar?: string;
    isSlackActive?: boolean;

    constructor(
        companyId: number,
        firstName: string,
        lastName: string,
        email: string,
        departmentId: number,
        empStatus: EmployeeStatusEnum = EmployeeStatusEnum.ACTIVE,
        phNumber?: string,
        billingAmount?: number,
        remarks?: string,
        slackUserId?: string,
        slackDisplayName?: string,
        slackAvatar?: string,
        isSlackActive?: boolean
    ) {
        this.companyId = companyId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.departmentId = departmentId;
        this.empStatus = empStatus;
        this.phNumber = phNumber;
        this.billingAmount = billingAmount;
        this.remarks = remarks;
        this.slackUserId = slackUserId;
        this.slackDisplayName = slackDisplayName;
        this.slackAvatar = slackAvatar;
        this.isSlackActive = isSlackActive;
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
        departmentId: number,
        empStatus: EmployeeStatusEnum = EmployeeStatusEnum.ACTIVE,
        phNumber?: string,
        billingAmount?: number,
        remarks?: string,
        slackUserId?: string,
        slackDisplayName?: string,
        slackAvatar?: string,
        isSlackActive?: boolean
    ) {
        super(companyId, firstName, lastName, email, departmentId, empStatus, phNumber, billingAmount, remarks, slackUserId, slackDisplayName, slackAvatar, isSlackActive);
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
    departmentId: number;
    departmentName?: string;
    remarks?: string;
    slackUserId?: string;
    slackDisplayName?: string;
    slackAvatar?: string;
    isSlackActive?: boolean;

    constructor(
        id: number,
        companyId: number,
        firstName: string,
        lastName: string,
        email: string,
        departmentId: number,
        empStatus: EmployeeStatusEnum,
        phNumber?: string,
        billingAmount?: number,
        remarks?: string,
        departmentName?: string,
        slackUserId?: string,
        slackDisplayName?: string,
        slackAvatar?: string,
        isSlackActive?: boolean
    ) {
        this.id = id;
        this.companyId = companyId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.departmentId = departmentId;
        this.empStatus = empStatus;
        this.phNumber = phNumber;
        this.billingAmount = billingAmount;
        this.remarks = remarks;
        this.departmentName = departmentName;
        this.slackUserId = slackUserId;
        this.slackDisplayName = slackDisplayName;
        this.slackAvatar = slackAvatar;
        this.isSlackActive = isSlackActive;
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
