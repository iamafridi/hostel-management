import z from 'zod';

const createNotificationValidationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    message: z.string().trim().min(1, 'Message is required'),
    type: z.enum(['info', 'success', 'warning', 'error']).optional(),
    channel: z.enum(['in-app', 'email', 'sms']).optional(),
    recipientId: z.string().trim().min(1).optional(),
    recipientRole: z.string().trim().min(1).optional(),
    referenceId: z.string().trim().min(1).optional(),
    correlationId: z.string().trim().min(1).optional(),
    isRead: z.boolean().optional(),
    source: z.enum(['api', 'rabbitmq', 'kafka']).optional(),
  }),
});

const updateNotificationValidationSchema = z.object({
  body: z.object({
    isRead: z.boolean().optional(),
    failureReason: z.string().optional(),
    retryCount: z.number().int().nonnegative().optional(),
  }),
});

export const NotificationValidations = {
  createNotificationValidationSchema,
  updateNotificationValidationSchema,
};
