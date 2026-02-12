
import { DataSource } from 'typeorm';
import { SystemMenuEntity } from '/home/sai/adminvault/packages/backend/src/app/features/iam/entities/system-menu.entity';
import { RoleMenuEntity } from '/home/sai/adminvault/packages/backend/src/app/features/iam/entities/role-menu.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: './packages/backend/.env' });

async function verify() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities: [SystemMenuEntity, RoleMenuEntity],
        synchronize: false,
    });

    await dataSource.initialize();
    console.log('--- System Menus ---');
    const menus = await dataSource.getRepository(SystemMenuEntity).find();
    console.log(JSON.stringify(menus, null, 2));

    console.log('\n--- Role Permissions for iam ---');
    const perms = await dataSource.getRepository(RoleMenuEntity).find({ where: { menuKey: 'iam' } });
    console.log(JSON.stringify(perms, null, 2));

    await dataSource.destroy();
}

verify().catch(console.error);
