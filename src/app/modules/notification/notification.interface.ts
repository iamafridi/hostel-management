export type TNotificationType = 'info' | 'success' | 'warning' | 'error';

export type TNotificationChannel = 'in-app' | 'email' | 'sms';

export type TNotificationSource = 'api' | 'rabbitmq' | 'kafka';

// the id, delivery state and source are derived by the service, callers only supply the content
export type TNotificationPayload = Partial<TNotification> &
  Pick<TNotification, 'title' | 'message'>;

export type TNotification = {
  id: string;
  title: string;
  message: string;
  type: TNotificationType;
  channel: TNotificationChannel;
  recipientId?: string;
  recipientRole?: string;
  referenceId?: string;
  correlationId?: string;
  isRead: boolean;
  deliveredAt?: Date;
  failureReason?: string;
  retryCount: number;
  source: TNotificationSource;
  isDeleted?: boolean;
};
