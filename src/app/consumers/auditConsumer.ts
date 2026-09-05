import { TAuditLog } from '../modules/auditLog/auditLog.interface';
import { AuditLog } from '../modules/auditLog/auditLog.model';
import {
  createKafkaConsumer,
  EVENT_TOPICS,
  isEventBusEnabled,
  parseEventEnvelope,
  publishToDlq,
} from '../utils/eventBus';

export const AUDIT_CONSUMER_GROUP = 'audit-persist-group';

// the audit middleware publishes every mutating request, this consumer owns the persistence
export const startAuditConsumer = async () => {
  if (!isEventBusEnabled()) {
    console.log(
      '[audit-consumer] KAFKA_BROKERS is not configured, the consumer is disabled',
    );
    return null;
  }

  const consumer = createKafkaConsumer(AUDIT_CONSUMER_GROUP);
  await consumer.connect();
  await consumer.subscribe({
    topic: EVENT_TOPICS.auditCud,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const envelope = parseEventEnvelope<TAuditLog>(message.value);
      if (!envelope) return;

      try {
        await AuditLog.create({
          ...envelope.payload,
          eventId: envelope.eventId,
          correlationId: envelope.correlationId,
          source: 'kafka',
        });
      } catch (err) {
        const reason = (err as Error).message;

        // a redelivered event is a duplicate, not a failure, so it is acknowledged quietly
        if ((err as { code?: number })?.code === 11000) {
          console.log(
            `[audit-consumer] duplicate event ${envelope.eventId} was ignored`,
          );
          return;
        }

        console.error(
          '[audit-consumer] failed to persist the audit entry:',
          reason,
        );

        await publishToDlq({
          topic: EVENT_TOPICS.auditCud,
          consumerGroup: AUDIT_CONSUMER_GROUP,
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
    `[audit-consumer] consuming ${EVENT_TOPICS.auditCud} as ${AUDIT_CONSUMER_GROUP}`,
  );

  return consumer;
};
