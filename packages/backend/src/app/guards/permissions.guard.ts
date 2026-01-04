import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import { AuthUsersEntity } from '../features/auth-users/entities/auth-users.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private dataSource: DataSource
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        // Fetch user with roles and permissions if not already loaded
        const userRepo = this.dataSource.getRepository(AuthUsersEntity);
        const userWithDetails = await userRepo.findOne({
            where: { id: user.id },
            relations: ['roles', 'roles.permissions']
        });

        if (!userWithDetails) {
            return false;
        }

        const hasPermission = userWithDetails.roles.some(role =>
            role.permissions.some(permission =>
                permission.resource === requiredPermission.resource &&
                permission.action === requiredPermission.action
            )
        );

        if (!hasPermission) {
            throw new ForbiddenException(`You do not have permission to ${requiredPermission.action} ${requiredPermission.resource}`);
        }

        return true;
    }
}
