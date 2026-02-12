import { UserRoleEnum } from '../enums/user-role.enum';

export interface SystemMenu {
    id: number;
    key: string;
    label: string;
    icon?: string;
    parentId?: number;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    children?: SystemMenu[];
}

export interface CreateMenuDto {
    key: string;
    label: string;
    icon?: string;
    parentId?: number;
    displayOrder?: number;
    isActive?: boolean;
}

export interface UpdateMenuDto extends Partial<CreateMenuDto> { }

export interface RoleMenuAssignment {
    menuKey: string;
    permissions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        scopes?: string[];
    };
}
