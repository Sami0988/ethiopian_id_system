import { FastifyReply, FastifyRequest } from 'fastify';
import type { LoggerOptions } from 'pino';

/**
 * Production-grade Pino logger configuration
 * - JSON structured logs
 * - Sensitive data redaction
 * - Request/response serializers
 */

// Extended types to include missing properties
interface ExtendedFastifyRequest extends FastifyRequest {
  routerPath?: string;
}

interface ExtendedFastifyError extends Error {
  code?: string | number;
  statusCode?: number;
  validation?: unknown[];
  validationContext?: string;
}

export const pinoOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',

  // ✅ Mask sensitive data anywhere it may appear
  redact: {
    paths: [
      // Headers
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'req.headers["x-api-key"]',

      // Request body
      'req.body.password',
      'req.body.currentPassword',
      'req.body.newPassword',
      'req.body.oldPassword',
      'req.body.refreshToken',
      'req.body.accessToken',
      'req.body.jwt',
      'req.body.apiKey',
      'req.body.secret',

      // Wildcard patterns for nested objects
      '*.password',
      '*.secret',
      '*.token',
      '*.apiKey',
      '*.accessToken',
      '*.refreshToken',
    ],
    remove: true, // Remove instead of replacing with [Redacted]
  },

  // ✅ Custom serializers for consistent log format
  serializers: {
    req(req: FastifyRequest) {
      const extendedReq = req as ExtendedFastifyRequest;

      return {
        id: req.id,
        method: req.method,
        url: req.url,
        path: extendedReq.routerPath ?? req.url,
        headers: {
          'user-agent': req.headers['user-agent'],
          referer: req.headers.referer,
          host: req.headers.host,
          // Include other safe headers as needed
        },
        remoteAddress: req.ip,
        remotePort: req.socket?.remotePort,
      };
    },

    res(res: FastifyReply) {
      return {
        statusCode: res.statusCode,
      };
    },

    err(err: Error) {
      const extendedErr = err as ExtendedFastifyError;

      return {
        type: err.name,
        message: err.message,
        stack: err.stack,
        code: extendedErr.code,
        statusCode: extendedErr.statusCode,
      };
    },
  },

  // ✅ Production: JSON, Development: can use pino-pretty
  // In production, this will be pure JSON
  // For development with pretty logs, set: transport: { target: 'pino-pretty' }
  ...(process.env.NODE_ENV === 'development' && process.env.LOG_PRETTY === 'true'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),

  // ✅ Add formatters for consistent log structure
  formatters: {
    level(label: string) {
      return { level: label.toUpperCase() };
    },
    bindings(bindings: { pid?: number; hostname?: string }) {
      return {
        pid: bindings.pid,
        hostname: bindings.hostname,
        node_version: process.version,
      };
    },
  },

  // ✅ Timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

// Export types for use elsewhere
export type { ExtendedFastifyRequest, ExtendedFastifyError };
