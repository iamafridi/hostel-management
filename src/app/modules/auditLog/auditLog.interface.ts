export type TAuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RETRY'
  | 'DLQ_FAILED';

export type TAuditSource = 'kafka' | 'direct' | 'rabbitmq' | 'dlq';

export type TAuditActor = {
  userId?: string;
  email?: string;
  role?: string;
};

export type TAuditLog = {
  eventId?: string;
  correlationId: string;
  action: TAuditAction;
  module: string;
  resourceId?: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  actor: TAuditActor;
  ip?: string;
  userAgent?: string;
  requestBody?: Record<string, unknown>;
  responseSummary?: Record<string, unknown>;
  errorMessage?: string;
  retryCount?: number;
  source: TAuditSource;
  isDeleted?: boolean;
};

export type TAuditBucket = {
  _id: string | { module?: string; statusCode?: number };
  total: number;
  totalAmount?: number;
};
