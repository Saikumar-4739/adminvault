import { DataSource, EntityManager, Repository, EntityTarget, ObjectLiteral } from 'typeorm';

export class GenericTransactionManager {
    private queryRunner: any;
    private manager: EntityManager;

    constructor(private dataSource: DataSource) { }

    async startTransaction(): Promise<void> {
        this.queryRunner = this.dataSource.createQueryRunner();
        await this.queryRunner.connect();
        await this.queryRunner.startTransaction();
        this.manager = this.queryRunner.manager;
    }

    async completeTransaction(): Promise<void> {
        if (this.queryRunner) {
            await this.queryRunner.commitTransaction();
            await this.queryRunner.release();
        }
    }

    async releaseTransaction(): Promise<void> {
        if (this.queryRunner) {
            await this.queryRunner.rollbackTransaction();
            await this.queryRunner.release();
        }
    }

    getRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
        if (!this.manager) {
            throw new Error('Transaction not started. Call startTransaction() first.');
        }
        return this.manager.getRepository(target);
    }

    getManager(): EntityManager {
        if (!this.manager) {
            throw new Error('Transaction not started. Call startTransaction() first.');
        }
        return this.manager;
    }
}
