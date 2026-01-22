import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { requestContextStorage } from '../common/context/request-context.store';

// Augment FastifyRequest interface to include our custom properties
declare module 'fastify' {
  interface FastifyRequest {
    _startAt?: bigint;
  }
}

/**
 * Register request logging hooks
 * - Logs every request with: requestId, method, path, status, duration
 * - Uses AsyncLocalStorage to get requestId
 * - Measures request duration in milliseconds
 */
export function registerRequestLogging(app: NestFastifyApplication): void {
  const fastify = app.getHttpAdapter().getInstance();

  // ✅ Start timing on request
  fastify.addHook('onRequest', (req: FastifyRequest, _reply: FastifyReply, done) => {
    req._startAt = process.hrtime.bigint();
    done();
  });

  // ✅ Log after response with full context
  fastify.addHook('onResponse', (req: FastifyRequest, reply: FastifyReply, done) => {
    const start = req._startAt;
    const durationMs = start ? Number((process.hrtime.bigint() - start) / 1000000n) : undefined;

    // Get requestId from AsyncLocalStorage context
    const ctx = requestContextStorage.getStore();
    const requestId = ctx?.requestId;
    const tenantId = ctx?.tenantId;
    const userId = ctx?.userId;

    // ✅ Structured log with all request metadata
    req.log.info(
      {
        requestId,
        tenantId,
        userId,
        method: req.method,
        path: req.url,
        status: reply.statusCode,
        durationMs,
        userAgent: req.headers['user-agent'],
      },
      'request.completed'
    );

    done();
  });

  // ✅ Log errors with requestId
  fastify.addHook(
    'onError',
    (req: FastifyRequest, _reply: FastifyReply, error: Error, done: () => void) => {
      const ctx = requestContextStorage.getStore();
      const requestId = ctx?.requestId;

      req.log.error(
        {
          requestId,
          tenantId: ctx?.tenantId,
          userId: ctx?.userId,
          method: req.method,
          path: req.url,
          err: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        'request.error'
      );

      done();
    }
  );
}
