import { TNotificationEventPayload } from '../interface/event';
import { NotificationServices } from '../modules/notification/notification.service';
import { MQ_QUEUES, consumeTasks, isQueueEnabled } from '../utils/messageQueue';

// the rabbitmq side of the pipeline : the queue itself handles retries and dead lettering
export const startNotificationConsumer = async () => {
  if (!isQueueEnabled()) {
    console.log(
      '[notification-consumer] RABBITMQ_URL is not configured, the consumer is disabled',
    );
    return null;
  }

  const channel = await consumeTasks<TNotificationEventPayload>(
    MQ_QUEUES.notificationPush,
    async (payload, envelope) => {
      const notification = await NotificationServices.createNotificationIntoDB({
        title: payload.title,
        message: payload.message,
        type: payload.type ?? 'info',
        channel: payload.channel ?? 'in-app',
        recipientId: payload.recipientId,
        recipientRole: payload.recipientRole,
        referenceId: payload.referenceId,
        correlationId: envelope.correlationId,
        source: 'rabbitmq',
      });

      // an out of app channel would hand the notification to the matching provider here
      if (payload.channel === 'email' || payload.channel === 'sms') {
        console.log(
          `[notification-consumer] dispatching the notification ${notification.id} through ${payload.channel}`,
        );
      }

      console.log(
        `[notification-consumer] delivered notification ${notification.id}`,
      );
    },
    { prefetch: 5 },
  );

  if (!channel) {
    console.log(
      '[notification-consumer] the notification queue is not reachable right now',
    );
    return null;
  }

  console.log(
    `[notification-consumer] consuming ${MQ_QUEUES.notificationPush}`,
  );

  return channel;
};
