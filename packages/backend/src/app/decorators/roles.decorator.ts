import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '@adminvault/shared-models';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(ROLES_KEY, roles);
