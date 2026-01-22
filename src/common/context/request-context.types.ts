export type RequestContext = {
  requestId: string;
  tenantId?: string;
  userId?: string;
  isSuperAdmin?: boolean;
};
