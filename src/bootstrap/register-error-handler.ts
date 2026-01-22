// src/bootstrap/register-error-handler.ts
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { HttpExceptionFilter } from '../common/exceptions/exception-filters/http-exception.filter';
import { DatabaseExceptionFilter } from '../common/exceptions/exception-filters/database-exception.filter';

export function registerErrorHandler(app: NestFastifyApplication) {
  // ✅ Order: DatabaseExceptionFilter FIRST, HttpExceptionFilter LAST (LIFO execution)
  app.useGlobalFilters(
    new DatabaseExceptionFilter(), // Runs FIRST - ONLY Postgres errors
    new HttpExceptionFilter() // Runs SECOND - Catches AppError + everything else
  );

  const fastify = app.getHttpAdapter().getInstance();

  fastify.setErrorHandler((error: any, request, reply) => {
    // Fallback for errors that bypass NestJS filters
    const requestId = request.id || 'unknown';
    const statusCode = error.statusCode || error.status || 500;

    request.log.error(
      {
        error: error.message || error,
        stack: error.stack,
      },
      'Unhandled error in Fastify native handler'
    );

    return reply.status(statusCode).send({
      requestId,
      errorCode: error.errorCode || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  });
}
