// Shared event contracts for the kafka / rabbitmq event driven layer

export type TAuditEventPayload = {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  module: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  actor: {
    userId?: string;
    email?: string;
    role?: string;
  };
  ip?: string;
  userAgent?: string;
  requestBody?: Record<string, unknown>;
  responseSummary?: Record<string, unknown>;
};

export type TFeePaidEventPayload = {
  paymentId: string;
  receiptNumber: string;
  feeId: string;
  studentId: string;
  amount: number;
  method: string;
  paidAmount: number;
  dueAmount: number;
  status: string;
};

export type TNotificationEventPayload = {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  channel?: 'in-app' | 'email' | 'sms';
  recipientId?: string;
  recipientRole?: string;
  referenceId?: string;
};

export type TDeadLetterEventPayload = {
  originalTopic: string;
  consumerGroup: string;
  failureReason: string;
  retryCount?: number;
  failedAt?: string;
  originalEvent?: TEventEnvelope<unknown>;
};

export type TEventEnvelope<T> = {
  eventId: string;
  eventType: string;
  correlationId: string;
  timestamp: string;
  source: string;
  payload: T;
};
