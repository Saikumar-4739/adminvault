import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { EmailAccountsEntity } from "../entities/email-accounts.entity";

@Injectable()
export class EmailAccountsRepository extends Repository<EmailAccountsEntity> {
    constructor(private dataSource: DataSource) {
        super(EmailAccountsEntity, dataSource.createEntityManager());
    }
}
