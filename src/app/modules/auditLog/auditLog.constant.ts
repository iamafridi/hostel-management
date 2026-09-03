import config from '../../config';
import { TAuditAction, TAuditSource } from './auditLog.interface';

export const AuditLogSearchableFields = [
  'module',
  'path',
  'action',
  'method',
  'resourceId',
  'correlationId',
  'actor.email',
  'actor.userId',
];

export const AuditActions: TAuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'RETRY',
  'DLQ_FAILED',
];

// actions produced by an http request, the consumers write RETRY / DLQ_FAILED entries
export const CudActions: TAuditAction[] = ['CREATE', 'UPDATE', 'DELETE'];

export const AuditSources: TAuditSource[] = [
  'kafka',
  'direct',
  'rabbitmq',
  'dlq',
];

export const AuditMethodActionMap: Record<string, TAuditAction | undefined> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// the audit trail must never audit itself and health probes are not interesting
export const AuditIgnoredPaths = ['/audit-logs', '/health'];

// credentials are never written to the audit trail
export const AuditSensitiveFields = [
  'password',
  'oldPassword',
  'newPassword',
  'token',
  'idToken',
  'refreshToken',
  'secret',
  'authorization',
  'qrToken',
];

export const AuditRedactedValue = '[REDACTED]';

// the trail is kept for a limited window and expires through a ttl index
export const AuditLogRetentionDays = Number(config.audit_log_ttl_days) || 30;

export const AuditLogRetentionSeconds = AuditLogRetentionDays * 24 * 60 * 60;
