import 'module-alias/register';
import { config } from 'dotenv';
import { resolve } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import "reflect-metadata";

// Load environment variables from various possible locations
const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), 'packages/backend/.env'),
  resolve(__dirname, '.env'),
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../.env'),
];

for (const envPath of envPaths) {
  config({ path: envPath });
}
Logger.log(`Environment variables loaded. MICROSOFT_CLIENT_ID: ${process.env.MICROSOFT_CLIENT_ID ? 'Set' : 'Not Set'}`, 'Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 const allowedOrigins = [
  'https://inolyse.live',
  'https://www.inolyse.live',
  'http://localhost:3000',
  'http://localhost:4200',
];

app.enableCors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
  ],
});

  app.setGlobalPrefix('api');

  (app.getHttpAdapter().getInstance() as any).set('trust proxy', true);

  // Swagger Configuration (for REST API documentation)
  const config = new DocumentBuilder()
    .setTitle('AdminVault')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'AdminVault',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/docs`
  );
}

bootstrap();
