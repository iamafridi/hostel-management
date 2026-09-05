import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { TDeadLetterEventPayload, TEventEnvelope } from '../interface/event';
import { AuditLog } from '../modules/auditLog/auditLog.model';
import {
  createKafkaConsumer,
  EVENT_TOPICS,
  isEventBusEnabled,
  parseEventEnvelope,
  publish,
} from '../utils/eventBus';

export const DLQ_CONSUMER_GROUP = 'dlq-handler';

export const DLQ_MAX_RETRIES = 3;

// exponential backoff between redrive attempts : 10s, 60s, 300s
export const DLQ_RETRY_DELAYS_MS = [10000, 60000, 300000];

// the original event is replayed on its own topic so a recovered dependency can still process it
const redriveDeadLetter = async (
  envelope: TEventEnvelope<TDeadLetterEventPayload>,
  attempts: number,
) => {
  const { originalEvent, originalTopic } = envelope.payload;

  if (!originalEvent || !originalTopic) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The dead letter entry does not carry the original event',
    );
  }

  const replayed = await publish(originalTopic, originalEvent.payload, {
    key: envelope.correlationId,
    correlationId: envelope.correlationId,
    // the consuming service reads this back and keeps counting instead of starting over
    headers: { 'x-redriven': 'true', 'x-retry-count': String(attempts) },
  });

  if (!replayed) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'The event bus is not available',
    );
  }
};

// after the retries are exhausted the entry is kept in the audit trail as a failed delivery
const recordDlqFailure = async (
  envelope: TEventEnvelope<TDeadLetterEventPayload>,
  reason: string,
  attempts: number,
) => {
  try {
    await AuditLog.create({
      correlationId: envelope.correlationId,
      action: 'DLQ_FAILED',
      module: 'dlq',
      method: 'CONSUMER',
      path: envelope.payload.originalTopic ?? 'unknown',
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      durationMs: 0,
      actor: {},
      errorMessage: `${envelope.payload.failureReason} | last redrive error : ${reason}`,
      retryCount: attempts,
      source: 'dlq',
    });
  } catch (err) {
    console.error(
      '[dlq-consumer] failed to record the dead letter entry:',
      (err as Error).message,
    );
  }
};

export const startDlqConsumer = async () => {
  if (!isEventBusEnabled()) {
    console.log(
      '[dlq-consumer] KAFKA_BROKERS is not configured, the consumer is disabled',
    );
    return null;
  }

  const consumer = createKafkaConsumer(DLQ_CONSUMER_GROUP);
  await consumer.connect();
  await consumer.subscribe({
    topic: EVENT_TOPICS.dlqAll,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const envelope = parseEventEnvelope<TDeadLetterEventPayload>(
        message.value,
      );
      if (!envelope) return;

      // the count is carried by the header, or by the payload when another consumer produced it
      const deliveredAttempts = Number(
        message.headers?.['x-retry-count']?.toString() ??
          envelope.payload.retryCount ??
          0,
      );
      const attempts = deliveredAttempts + 1;

      try {
        await redriveDeadLetter(envelope, attempts);
        console.log(
          `[dlq-consumer] replayed ${envelope.payload.originalTopic} on attempt ${attempts}`,
        );
      } catch (err) {
        const reason = (err as Error).message;

        if (attempts <= DLQ_MAX_RETRIES) {
          const delay = DLQ_RETRY_DELAYS_MS[attempts - 1];
          console.error(
            `[dlq-consumer] attempt ${attempts} failed, retrying in ${delay}ms: ${reason}`,
          );

          setTimeout(() => {
            void publish(EVENT_TOPICS.dlqAll, envelope.payload, {
              key: envelope.correlationId,
              correlationId: envelope.correlationId,
              headers: { 'x-retry-count': String(attempts) },
            });
          }, delay);

          return;
        }

        console.error(
          `[dlq-consumer] giving up on ${envelope.payload.originalTopic} after ${attempts} attempts: ${reason}`,
        );

        await recordDlqFailure(envelope, reason, attempts);
      }
    },
  });

  console.log(
    `[dlq-consumer] consuming ${EVENT_TOPICS.dlqAll} as ${DLQ_CONSUMER_GROUP}`,
  );

  return consumer;
};
