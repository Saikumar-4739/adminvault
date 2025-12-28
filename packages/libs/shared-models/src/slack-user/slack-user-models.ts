import { GlobalResponse } from '../common/global-response';

export interface SlackUserModel {
    id: number;
    slackUserId?: string;
    name: string;
    email: string;
    displayName?: string;
    role?: string;
    department?: string;
    avatar?: string;
    isActive: boolean;
    phone?: string;
    notes?: string;
    companyId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class CreateSlackUserModel {
    name!: string;
    email!: string;
    slackUserId?: string;
    displayName?: string;
    role?: string;
    department?: string;
    avatar?: string;
    phone?: string;
    notes?: string;
    companyId!: number;
    userId!: number;
}

export class UpdateSlackUserModel {
    id!: number;
    name?: string;
    email?: string;
    slackUserId?: string;
    displayName?: string;
    role?: string;
    department?: string;
    avatar?: string;
    isActive?: boolean;
    phone?: string;
    notes?: string;
    userId!: number;
}

export class DeleteSlackUserModel {
    id!: number;
    userId!: number;
}

export class GetSlackUserModel {
    id!: number;
}

export class GetAllSlackUsersModel extends GlobalResponse {
    override slackUsers: SlackUserModel[];
    constructor(status: boolean, code: number, message: string, slackUsers: SlackUserModel[]) {
        super(status, code, message);
        this.slackUsers = slackUsers;
    }
}

export class GetSlackUserByIdModel extends GlobalResponse {
    override slackUser: SlackUserModel;
    constructor(status: boolean, code: number, message: string, slackUser: SlackUserModel) {
        super(status, code, message);
        this.slackUser = slackUser;
    }
}
