import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function registerSwagger(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') return;

  const config = new DocumentBuilder()
    .setTitle('NexusQR SaaS API')
    .setDescription('Multi-tenant QR Code & Digital Profile Management Platform')
    .setVersion('1.0.0')
    .addServer('/api/v1', 'API Version 1')

    // ✅ JWT access token (Authorization: Bearer <token>)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token'
    )

    // ✅ Optional: refresh token via cookie (only if you really use it)
    .addCookieAuth('refreshToken')

    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
    },
  });
}
