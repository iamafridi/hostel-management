import z from 'zod';

const createAuditLogValidationSchema = z.object({
  body: z.object({
    correlationId: z.string().trim().min(1, 'Correlation ID is required'),
    action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'RETRY', 'DLQ_FAILED']),
    module: z.string().trim().min(1, 'Module is required'),
    resourceId: z.string().trim().min(1).optional(),
    method: z.string().trim().min(1, 'Method is required'),
    path: z.string().trim().min(1, 'Path is required'),
    statusCode: z.number().int('Status code must be an integer'),
    durationMs: z.number().nonnegative().optional(),
    actor: z
      .object({
        userId: z.string().optional(),
        email: z.string().email().optional(),
        role: z.string().optional(),
      })
      .optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    requestBody: z.record(z.string(), z.unknown()).optional(),
    responseSummary: z.record(z.string(), z.unknown()).optional(),
    errorMessage: z.string().optional(),
    retryCount: z.number().int().nonnegative().optional(),
    source: z.enum(['kafka', 'direct', 'rabbitmq', 'dlq']).optional(),
  }),
});

const updateAuditLogValidationSchema = z.object({
  body: z.object({
    statusCode: z.number().int('Status code must be an integer').optional(),
    errorMessage: z.string().optional(),
    retryCount: z.number().int().nonnegative().optional(),
    resourceId: z.string().trim().min(1).optional(),
  }),
});

export const AuditLogValidations = {
  createAuditLogValidationSchema,
  updateAuditLogValidationSchema,
};
