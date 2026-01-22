/**
 * Global HTTP Exception Filter
 *
 * Catches all exceptions and returns a consistent, structured error response.
 * Handles:
 * - Custom AppError instances (ValidationError, UnauthorizedError, etc.)
 * - NestJS HttpException instances
 * - Unknown/unhandled errors
 *
 * Response format:
 * {
 *   success: false,
 *   statusCode: number,
 *   code: string,
 *   message: string,
 *   errors: any | null,
 *   path: string,
 *   method: string,
 *   requestId: string,
 *   timestamp: string,
 *   debug?: { exceptionName, stack } // dev only
 * }
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@/common/exceptions/app-errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isProd = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    console.log('HttpExceptionFilter caught exception:', {
      exception,
      exceptionType: typeof exception,
      constructor: exception?.constructor?.name,
      message: (exception as any)?.message,
      stack: (exception as any)?.stack,
    });

    const requestId = (request as any).id || 'unknown';
    const method = request.method;
    const path = request.url;

    // Determine status, code, message, and errors
    const { status, code, message, errors } = this.parseException(exception);

    // Build response body
    const body: Record<string, any> = {
      success: false,
      statusCode: status,
      code,
      message,
      errors: errors ?? null,
      path,
      method,
      requestId,
      timestamp: new Date().toISOString(),
    };

    // Add debug info in development
    if (!this.isProd) {
      body.debug = {
        exceptionName: (exception as any)?.name || 'Unknown',
        stack: (exception as any)?.stack || null,
      };
    }

    // Log the error
    this.logError(exception, status, method, path, requestId);

    // Send response
    return reply.status(status).send(body);
  }

  /**
   * Parse exception to extract status, code, message, and errors
   */
  private parseException(exception: unknown): {
    status: number;
    code: string;
    message: string;
    errors?: any;
  } {
    // 1. Custom AppError (ValidationError, UnauthorizedError, etc.)
    if (exception instanceof AppError) {
      return {
        status: exception.statusCode,
        code: exception.errorCode,
        message: exception.message,
        errors: exception.details,
      };
    }

    // 2. NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      // Response can be string or object
      const payload =
        typeof response === 'string' ? { message: response } : (response as Record<string, any>);

      return {
        status,
        code: this.mapStatusToCode(status, payload),
        message: this.extractMessage(payload),
        errors:
          payload.errors ||
          (payload.message && typeof payload.message === 'object' ? payload.message : null),
      };
    }

    // 3. Unknown error
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: this.isProd
        ? 'Internal server error'
        : (exception as any)?.message || 'An unexpected error occurred',
      errors: null,
    };
  }

  /**
   * Map HTTP status to error code
   */
  private mapStatusToCode(status: number, payload: Record<string, any>): string {
    // Use explicit code if provided
    if (payload.code) return payload.code;

    // Map common status codes
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMIT_EXCEEDED';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_ERROR';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'HTTP_ERROR';
    }
  }

  /**
   * Extract message from payload (handles arrays and strings)
   */
  private extractMessage(payload: Record<string, any>): string {
    if (!payload.message) return 'Request failed';

    // Handle array of messages (class-validator)
    if (Array.isArray(payload.message)) {
      return payload.message.join(', ');
    }

    return payload.message;
  }

  /**
   * Log error with structured context
   */
  private logError(
    exception: unknown,
    status: number,
    method: string,
    path: string,
    requestId: string
  ) {
    const error = exception as any;
    const logContext = {
      requestId,
      method,
      path,
      status,
      errorName: error?.name || 'Unknown',
      errorMessage: error?.message || 'No message',
      errorCode: error?.errorCode || error?.code,
    };

    // Log as error for 5xx, warn for 4xx
    if (status >= 500) {
      this.logger.error(
        `💥 ${method} ${path} - ${status} ${error?.message || 'Internal error'}`,
        error?.stack,
        logContext
      );
    } else {
      this.logger.warn(
        `⚠️  ${method} ${path} - ${status} ${error?.message || 'Client error'}`,
        logContext
      );
    }
  }
}
