import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import {
  AuditIgnoredPaths,
  AuditMethodActionMap,
  AuditRedactedValue,
  AuditSensitiveFields,
} from '../modules/auditLog/auditLog.constant';
import { TAuditLog } from '../modules/auditLog/auditLog.interface';
import { AuditLogServices } from '../modules/auditLog/auditLog.service';
import { EVENT_TOPICS, isEventBusEnabled, publish } from '../utils/eventBus';

type TAuditRequest = Request & {
  user?: {
    userId?: string;
    email?: string;
    role?: string;
  };
  correlationId?: string;
};

// audit persistence must never hold a response hostage, so it is bounded
const AUDIT_WRITE_TIMEOUT_MS = 2000;

const maskSensitiveFields = (
  body: unknown,
): Record<string, unknown> | undefined => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return undefined;
  }

  const maskedBody: Record<string, unknown> = {};

  Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
    maskedBody[key] = AuditSensitiveFields.includes(key)
      ? AuditRedactedValue
      : value;
  });

  return maskedBody;
};

const resolveModuleName = (originalUrl: string) => {
  const [moduleName] = originalUrl.replace(/^\/api\/v1\/?/, '').split(/[/?]/);

  return moduleName || 'root';
};

const resolveResourceId = (body: unknown): string | undefined => {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const data = (body as { data?: unknown }).data;

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return undefined;
  }

  const record = data as { _id?: unknown; id?: unknown };
  const resourceId = record._id ?? record.id;

  return resourceId ? String(resourceId) : undefined;
};

const persistAuditEvent = async (payload: TAuditLog, correlationId: string) => {
  // the trail is published as a domain event so other services can consume it
  if (isEventBusEnabled()) {
    const published = await publish(EVENT_TOPICS.auditCud, payload, {
      key: payload.actor?.userId ?? correlationId,
      correlationId,
    });

    if (published) return;
  }

  // when kafka is down the entry is still written directly so nothing is lost
  try {
    await AuditLogServices.createAuditLogIntoDB({
      ...payload,
      source: 'direct',
    });
  } catch (err) {
    console.error(
      '[audit] failed to persist the audit entry:',
      (err as Error).message,
    );
  }
};

const persistAuditEventWithTimeout = (
  payload: TAuditLog,
  correlationId: string,
) =>
  Promise.race([
    persistAuditEvent(payload, correlationId),
    new Promise((resolve) => setTimeout(resolve, AUDIT_WRITE_TIMEOUT_MS)),
  ]);

const audit = (req: Request, res: Response, next: NextFunction) => {
  const auditRequest = req as TAuditRequest;
  const action = AuditMethodActionMap[req.method];

  if (
    !action ||
    AuditIgnoredPaths.some((path) => req.originalUrl.includes(path))
  ) {
    return next();
  }

  const correlationId = auditRequest.correlationId ?? randomUUID();
  auditRequest.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  const startedAt = Date.now();
  const requestBody = maskSensitiveFields(req.body);
  const actor = {
    userId: auditRequest.user?.userId,
    email: auditRequest.user?.email,
    role: auditRequest.user?.role,
  };
  const originalJson = res.json.bind(res) as Response['json'];

  // the middleware hooks into the response so the written entry carries the real outcome
  res.json = ((body: unknown) => {
    const payload: TAuditLog = {
      correlationId,
      action,
      module: resolveModuleName(req.originalUrl),
      resourceId: resolveResourceId(body),
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      actor,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      requestBody,
      responseSummary: {
        success: Boolean((body as { success?: unknown })?.success),
        message: (body as { message?: unknown })?.message as string,
      },
      source: 'direct',
    };

    void persistAuditEventWithTimeout(payload, correlationId).then(() =>
      originalJson(body),
    );

    return res;
  }) as Response['json'];

  next();
};

export default audit;
