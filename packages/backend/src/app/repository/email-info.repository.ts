import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { EmailInfoEntity } from "../entities/email-info.entity";

@Injectable()
export class EmailInfoRepository extends Repository<EmailInfoEntity> {
    constructor(private dataSource: DataSource) {
        super(EmailInfoEntity, dataSource.createEntityManager());
    }
}
