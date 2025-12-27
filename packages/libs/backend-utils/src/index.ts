// DO NOT export the NestJS module here - it contains decorators that break Next.js compilation
// The module should only be imported in backend code
// export * from './lib/backend-utils.module';

export * from './lib/error-response';
export * from './lib/return-exception';
export * from './lib/global-response';
