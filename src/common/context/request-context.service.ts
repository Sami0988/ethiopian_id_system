import { Injectable } from '@nestjs/common';
import { requestContextStorage } from './request-context.store';
import type { RequestContext } from './request-context.types';

@Injectable()
export class RequestContextService {
  /**
   * Get the current request context (returns undefined if not in ALS scope)
   */
  get(): RequestContext | undefined {
    return requestContextStorage.getStore();
  }

  /**
   * Get the current request context (throws if not in ALS scope)
   */
  require(): RequestContext {
    const ctx = this.get();
    if (!ctx) {
      throw new Error('RequestContext missing (ALS scope not initialized)');
    }
    return ctx;
  }

  /**
   * Get the current request ID
   */
  requestId(): string {
    return this.require().requestId;
  }

  /**
   * Get the current tenant ID (undefined if not set)
   */
  tenantId(): string | undefined {
    return this.require().tenantId;
  }

  /**
   * Get the current user ID (undefined if not set)
   */
  userId(): string | undefined {
    return this.require().userId;
  }

  /**
   * Set the tenant ID for the current request context
   */
  setTenantId(tenantId: string): void {
    this.require().tenantId = tenantId;
  }

  /**
   * Set the user ID for the current request context
   */
  setUserId(userId: string): void {
    this.require().userId = userId;
  }

  /**
   * Check if tenant ID is set
   */
  hasTenantId(): boolean {
    return !!this.get()?.tenantId;
  }

  /**
   * Check if user ID is set
   */
  hasUserId(): boolean {
    return !!this.get()?.userId;
  }

  /**
   * Require tenant ID (throws if not set)
   */
  requireTenantId(): string {
    const tenantId = this.tenantId();
    if (!tenantId) {
      throw new Error('TenantId is required but not set in request context');
    }
    return tenantId;
  }

  /**
   * Require user ID (throws if not set)
   */
  requireUserId(): string {
    const userId = this.userId();
    if (!userId) {
      throw new Error('UserId is required but not set in request context');
    }
    return userId;
  }

  /**
   * Check if current user is a super admin
   */
  isSuperAdmin(): boolean {
    return this.require().isSuperAdmin || false;
  }
}
