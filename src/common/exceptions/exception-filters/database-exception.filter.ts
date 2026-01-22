// src/common/exceptions/exception-filters/database-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ApiError } from '../../interfaces/api-error.interface';

// PostgreSQL error interface
interface PostgresError {
  code: string;
  message: string;
  constraint?: string;
  table?: string;
  column?: string;
  detail?: string;
}

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // ✅ CRITICAL: Throw non-Postgres errors to next filter
    if (!this.isPostgresError(exception)) {
      throw exception; // Pass to HttpExceptionFilter
    }

    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<Record<string, unknown>>();

    const requestId = this.getRequestId(request);
    const response = this.createErrorResponse(exception, requestId, this.getRequestPath(request));

    reply.status(response.statusCode).send(response);
  }

  private isPostgresError(error: unknown): error is PostgresError {
    if (!error || typeof error !== 'object') return false;

    const err = error as Record<string, unknown>;
    return typeof err.code === 'string' && typeof err.message === 'string';
  }

  private getRequestId(request: Record<string, unknown>): string {
    const id = request.id;
    return typeof id === 'string' ? id : 'unknown';
  }

  private getRequestPath(request: Record<string, unknown>): string {
    const url = request.url;
    return typeof url === 'string' ? url : '/';
  }

  private createErrorResponse(
    error: PostgresError,
    requestId: string,
    path: string
  ): ApiError & { statusCode: number } {
    const { statusCode, errorCode, message } = this.mapErrorCode(error.code);

    const details: Record<string, string> = {
      code: error.code,
      message: error.message,
    };

    // Add optional fields
    const optionalFields = ['constraint', 'table', 'column', 'detail'] as const;
    optionalFields.forEach(field => {
      const value = error[field];
      if (typeof value === 'string') {
        details[field] = value;
      }
    });

    return {
      requestId,
      errorCode,
      message,
      details,
      timestamp: new Date().toISOString(),
      path,
      statusCode,
    };
  }

  private mapErrorCode(code: string) {
    switch (code) {
      case '23505':
        return {
          statusCode: 409,
          errorCode: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'A record with this value already exists',
        };
      case '23503':
        return {
          statusCode: 400,
          errorCode: 'FOREIGN_KEY_VIOLATION',
          message: 'Referenced record does not exist',
        };
      case '23502':
        return {
          statusCode: 400,
          errorCode: 'NULL_CONSTRAINT_VIOLATION',
          message: 'Required field cannot be empty',
        };
      default:
        return {
          statusCode: 500,
          errorCode: 'DATABASE_ERROR',
          message: 'Database operation failed',
        };
    }
  }
}
