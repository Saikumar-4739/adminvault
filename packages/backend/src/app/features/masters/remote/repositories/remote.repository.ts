import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { RemoteMasterEntity } from "../entities/remote.entity";

@Injectable()
export class RemoteRepository extends Repository<RemoteMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(RemoteMasterEntity, dataSource.createEntityManager());
    }
}
