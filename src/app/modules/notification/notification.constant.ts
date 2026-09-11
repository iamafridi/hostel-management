import {
  TNotificationChannel,
  TNotificationSource,
  TNotificationType,
} from './notification.interface';

export const NotificationSearchableFields = [
  'id',
  'title',
  'message',
  'recipientId',
  'referenceId',
];

export const NotificationTypes: TNotificationType[] = [
  'info',
  'success',
  'warning',
  'error',
];

export const NotificationChannels: TNotificationChannel[] = [
  'in-app',
  'email',
  'sms',
];

export const NotificationSources: TNotificationSource[] = [
  'api',
  'rabbitmq',
  'kafka',
];

export const NotificationIdPrefix = 'NTF';
