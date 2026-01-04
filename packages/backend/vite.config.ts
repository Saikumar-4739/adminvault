import { defineConfig } from 'vite';
import { join } from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
    plugins: [
        swc.vite({
            jsc: {
                parser: {
                    syntax: 'typescript',
                    decorators: true,
                    tsx: false,
                    dynamicImport: true,
                },
                target: 'es2022',
                transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true,
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@adminvault/shared-models': join(__dirname, '../libs/shared-models/src/index.ts'),
            '@adminvault/backend-utils': join(__dirname, '../libs/backend-utils/src/index.ts'),
        },
    },
    build: {
        outDir: '../../dist/packages/backend',
        emptyOutDir: true,
        lib: {
            entry: 'src/main.ts',
            formats: ['cjs'],
            fileName: 'main',
        },
        rollupOptions: {
            external: [
                /^@nestjs\/.*/,
                'typeorm',
                'reflect-metadata',
                'rxjs',
                'class-validator',
                'class-transformer',
                'bcrypt',
                'jsonwebtoken',
                'dotenv',
                'pg',
                'apollo-server-express',
                '@apollo/server',
                'graphql',
                'xlsx',
                'pdf-lib',
                'otplib',
                'qrcode',
                'kafkajs',
            ],
        },
        target: 'node18',
        ssr: true,
    },
    ssr: {
        external: ['otplib', 'qrcode', 'kafkajs'],
    },
});
