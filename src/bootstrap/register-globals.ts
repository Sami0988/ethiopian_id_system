import { ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

export function registerGlobals(app: NestFastifyApplication) {
  // Global validation pipe (transform and validate incoming data)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global Prefix for all routes (e.g., /api/v1)
  app.setGlobalPrefix('api/v1');
}
