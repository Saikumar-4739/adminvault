import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AuthUsersEntity } from "../entities/auth-users.entity";

@Injectable()
export class AuthUsersRepository extends Repository<AuthUsersEntity> {
    constructor(private dataSource: DataSource) {
        super(AuthUsersEntity, dataSource.createEntityManager());
    }

    async getUserRoles(userId: number): Promise<any[]> {
        return await this.dataSource.createQueryBuilder()
            .select('role.*')
            .from('roles', 'role')
            .innerJoin('user_roles', 'ur', 'ur.role_id = role.id')
            .where('ur.user_id = :userId', { userId })
            .getRawMany();
    }


    async assignRoleToUser(userId: number, roleId: number): Promise<void> {
        await this.dataSource.createQueryBuilder()
            .insert()
            .into('user_roles')
            .values({ user_id: userId, role_id: roleId })
            .orIgnore()
            .execute();
    }

    async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
        await this.dataSource.createQueryBuilder()
            .delete()
            .from('user_roles')
            .where('user_id = :userId AND role_id = :roleId', { userId, roleId })
            .execute();
    }

    async syncUserRoles(userId: number, roleIds: number[]): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.createQueryBuilder().delete().from('user_roles').where('user_id = :userId', { userId }).execute();
            if (roleIds.length > 0) {
                await queryRunner.manager.createQueryBuilder().insert().into('user_roles').values(roleIds.map(roleId => ({ user_id: userId, role_id: roleId }))).execute();
            }
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
