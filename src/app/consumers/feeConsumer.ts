import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import {
  TEventEnvelope,
  TFeePaidEventPayload,
  TNotificationEventPayload,
} from '../interface/event';
import {
  createKafkaConsumer,
  EVENT_TOPICS,
  isEventBusEnabled,
  parseEventEnvelope,
  publishToDlq,
} from '../utils/eventBus';
import { MQ_QUEUES, isQueueEnabled, publishTask } from '../utils/messageQueue';

export const FEE_CONSUMER_GROUP = 'fee-payment-group';

// kafka owns the event log, rabbitmq owns the delivery work : this consumer bridges the two
const handleFeePaid = async (
  envelope: TEventEnvelope<TFeePaidEventPayload>,
) => {
  const { payload } = envelope;

  if (!isQueueEnabled()) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'RABBITMQ_URL is not configured, the notification can not be queued',
    );
  }

  const queued = await publishTask<TNotificationEventPayload>(
    MQ_QUEUES.notificationPush,
    {
      title: 'Fee payment received',
      message: `A payment of ${payload.amount} has been received against receipt ${payload.receiptNumber}. The remaining due is ${payload.dueAmount}.`,
      type: 'success',
      channel: 'in-app',
      recipientId: payload.studentId,
      referenceId: payload.paymentId,
    },
    { key: payload.studentId, correlationId: envelope.correlationId },
  );

  if (!queued) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'The notification task could not be queued',
    );
  }

  console.log(
    `[fee-consumer] queued a notification for payment ${payload.paymentId}`,
  );
};

export const startFeeConsumer = async () => {
  if (!isEventBusEnabled()) {
    console.log(
      '[fee-consumer] KAFKA_BROKERS is not configured, the consumer is disabled',
    );
    return null;
  }

  const consumer = createKafkaConsumer(FEE_CONSUMER_GROUP);
  await consumer.connect();
  await consumer.subscribe({
    topic: EVENT_TOPICS.feePaid,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const envelope = parseEventEnvelope<TFeePaidEventPayload>(message.value);
      if (!envelope) return;

      try {
        await handleFeePaid(envelope);
      } catch (err) {
        const reason = (err as Error).message;
        console.error(
          '[fee-consumer] failed to process the fee payment event:',
          reason,
        );

        // unprocessable events go to the dead letter topic where the dlq handler redrives them
        await publishToDlq({
          topic: EVENT_TOPICS.feePaid,
          consumerGroup: FEE_CONSUMER_GROUP,
          event: envelope,
          reason,
          retryCount: Number(
            message.headers?.['x-retry-count']?.toString() ?? 0,
          ),
        });
      }
    },
  });

  console.log(
    `[fee-consumer] consuming ${EVENT_TOPICS.feePaid} as ${FEE_CONSUMER_GROUP}`,
  );

  return consumer;
};
