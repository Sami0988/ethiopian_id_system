import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { requestContextStorage } from '../common/context/request-context.store';

const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Register AsyncLocalStorage-based request context tracking
 * - Generates or accepts x-request-id header
 * - Creates ALS scope for each request
 * - Enables RequestContextService usage in services/repositories
 */
export function registerRequestContext(app: NestFastifyApplication): void {
  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook('onRequest', (req: FastifyRequest, reply: FastifyReply, done) => {
    // Get or generate request ID
    const incoming = (req.headers[REQUEST_ID_HEADER] as string | undefined)?.trim();
    const requestId = incoming?.length ? incoming : randomUUID();

    // Echo request ID back in response header
    reply.header(REQUEST_ID_HEADER, requestId);

    // Create AsyncLocalStorage scope for this request
    requestContextStorage.run({ requestId }, () => done());
  });
}
