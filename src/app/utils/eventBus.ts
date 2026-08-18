import { randomUUID } from 'crypto';
import { Consumer, Kafka, logLevel, Producer } from 'kafkajs';
import config from '../config';
import { TDeadLetterEventPayload, TEventEnvelope } from '../interface/event';

// domain event topics shared by the whole platform, notification delivery runs over rabbitmq
export const EVENT_TOPICS = {
  auditCud: 'erp.audit.cud',
  feePaid: 'erp.fee.paid',
  dlqAll: 'erp.dlq.all',
};

export type TEventTopic = (typeof EVENT_TOPICS)[keyof typeof EVENT_TOPICS];

// a broker that just went down should not slow every request down with a fresh connect attempt
const CONNECTION_COOLDOWN_MS = 30000;

let kafkaClient: Kafka | null = null;
let producer: Producer | null = null;
let producerConnection: Promise<Producer | null> | null = null;
let cooldownUntil = 0;

export const getKafkaBrokers = () =>
  (config.kafka_brokers ?? '')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

// kafkajs reports a refused connection without a message, so the code is used instead
const describeError = (err: unknown) => {
  const error = err as { message?: string; code?: string; name?: string };

  return (
    error?.message || error?.code || error?.name || 'unknown connection error'
  );
};

// without a broker list configured the event bus degrades to a silent no-op
export const isEventBusEnabled = () => getKafkaBrokers().length > 0;

const getKafkaClient = () => {
  if (!kafkaClient) {
    kafkaClient = new Kafka({
      clientId: config.kafka_client_id as string,
      brokers: getKafkaBrokers(),
      logLevel: logLevel.NOTHING,
      connectionTimeout: 3000,
      retry: { retries: 3, initialRetryTime: 300 },
    });
  }
  return kafkaClient;
};

const connectProducer = async (): Promise<Producer | null> => {
  if (!isEventBusEnabled()) return null;
  if (producer) return producer;

  if (!producerConnection) {
    producerConnection = (async () => {
      try {
        const kafkaProducer = getKafkaClient().producer({
          allowAutoTopicCreation: true,
        });
        await kafkaProducer.connect();
        producer = kafkaProducer;
        console.log('[event-bus] kafka producer connected');
        return kafkaProducer;
      } catch (err) {
        cooldownUntil = Date.now() + CONNECTION_COOLDOWN_MS;
        console.error(
          `[event-bus] kafka producer is unreachable, backing off for ${CONNECTION_COOLDOWN_MS / 1000}s:`,
          describeError(err),
        );
        return null;
      } finally {
        producerConnection = null;
      }
    })();
  }

  return producerConnection;
};

export const buildEventEnvelope = <T>(
  eventType: string,
  payload: T,
  options: { correlationId?: string } = {},
): TEventEnvelope<T> => ({
  eventId: randomUUID(),
  eventType,
  correlationId: options.correlationId ?? randomUUID(),
  timestamp: new Date().toISOString(),
  source: 'hostel-management-api',
  payload,
});

// publishes a domain event, never throws so a broker outage can not break a request
export const publish = async <T>(
  topic: TEventTopic | string,
  payload: T,
  options: {
    key?: string;
    correlationId?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<boolean> => {
  if (!isEventBusEnabled() || Date.now() < cooldownUntil) return false;

  const kafkaProducer = await connectProducer();
  if (!kafkaProducer) return false;

  const envelope = buildEventEnvelope(topic, payload, {
    correlationId: options.correlationId,
  });

  try {
    await kafkaProducer.send({
      topic,
      acks: -1,
      messages: [
        {
          key: options.key ?? envelope.correlationId,
          value: JSON.stringify(envelope),
          headers: {
            eventId: envelope.eventId,
            eventType: envelope.eventType,
            correlationId: envelope.correlationId,
            ...options.headers,
          },
        },
      ],
    });
    return true;
  } catch (err) {
    console.error(
      `[event-bus] failed to publish to ${topic}:`,
      describeError(err),
    );
    return false;
  }
};

// every consumer funnels events it can not recover from into a single dead letter topic
export const publishToDlq = async (options: {
  topic: string;
  consumerGroup: string;
  event: TEventEnvelope<unknown>;
  reason: string;
  retryCount?: number;
}): Promise<boolean> => {
  const payload: TDeadLetterEventPayload = {
    originalTopic: options.topic,
    consumerGroup: options.consumerGroup,
    failureReason: options.reason,
    retryCount: options.retryCount ?? 0,
    failedAt: new Date().toISOString(),
    originalEvent: options.event,
  };

  return publish(EVENT_TOPICS.dlqAll, payload, {
    key: options.event.correlationId,
    correlationId: options.event.correlationId,
    // the attempt count travels with the message so the retries stay bounded across consumers
    headers: { 'x-retry-count': String(payload.retryCount) },
  });
};

export const createKafkaConsumer = (groupId: string): Consumer => {
  const kafka = new Kafka({
    clientId: `${config.kafka_client_id}-${groupId}`,
    brokers: getKafkaBrokers(),
    logLevel: logLevel.NOTHING,
  });

  return kafka.consumer({
    groupId,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
  });
};

export const parseEventEnvelope = <T>(
  value: Buffer | null,
): TEventEnvelope<T> | null => {
  try {
    return JSON.parse(value?.toString() ?? '') as TEventEnvelope<T>;
  } catch (err) {
    console.error(
      '[event-bus] received a malformed event:',
      (err as Error).message,
    );
    return null;
  }
};

export const disconnectEventBus = async () => {
  if (!producer) return;
  try {
    await producer.disconnect();
    console.log('[event-bus] kafka producer disconnected');
  } catch (err) {
    console.error(
      '[event-bus] producer disconnect failed:',
      (err as Error).message,
    );
  } finally {
    producer = null;
  }
};
