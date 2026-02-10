
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { AssetInfoRepository } from '../src/app/features/asset-info/repositories/asset-info.repository';
// import { AssetInfoEntity } from '../src/app/features/asset-info/entities/asset-info.entity';
import * as path from 'path';

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('DB Config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
});

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: true,
    entities: [
        path.join(__dirname, '../src/**/*.entity.ts')
    ],
    ssl: process.env.DB_HOST?.includes('aivencloud.com') ? { rejectUnauthorized: false } : false,
});

async function run() {
    try {
        await dataSource.initialize();
        console.log('DataSource initialized');

        const repo = new AssetInfoRepository(dataSource);

        console.log('Testing getAssetsWithAssignments...');
        // Use a dummy companyId. If the query syntax is wrong, it will fail regardless of data.
        try {
            const assets = await repo.getAssetsWithAssignments({ companyId: 1 });
            console.log(`Success getAssetsWithAssignments. Found ${assets.length} assets.`);
        } catch (e) {
            console.error('FAILED getAssetsWithAssignments', e);
        }

        console.log('Testing searchAssets...');
        try {
            const searchResults = await repo.searchAssets({ companyId: 1, searchQuery: '' });
            console.log(`Success searchAssets. Found ${searchResults.length} assets.`);
        } catch (e) {
            console.error('FAILED searchAssets', e);
        }

    } catch (e) {
        console.error('Error executing script:', e);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

run();
