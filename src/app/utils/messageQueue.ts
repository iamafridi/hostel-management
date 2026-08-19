import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import config from '../config';
import { TEventEnvelope } from '../interface/event';
import { buildEventEnvelope } from './eventBus';

// kafka carries the event log, rabbitmq carries the delivery work
export const MQ_EXCHANGE = 'erp.dlx';

export const MQ_QUEUES = {
  notificationPush: 'erp.notification.push',
  notificationRetry: [
    'erp.notification.push.retry.1',
    'erp.notification.push.retry.2',
    'erp.notification.push.retry.3',
  ],
  notificationDlq: 'erp.dlq',
};

export const MQ_ROUTING_KEYS = {
  notificationPush: 'erp.notification.push',
  notificationDead: 'erp.notification.push.dead',
};

// exponential backoff between delivery attempts : 10s, 60s, 300s
export const MQ_RETRY_DELAYS = [10000, 60000, 300000];

export const MQ_MAX_RETRIES = MQ_RETRY_DELAYS.length;

const RECONNECT_DELAY_MS = 5000;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let connecting: Promise<Channel | null> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let cooldownUntil = 0;

export const isQueueEnabled = () => Boolean(config.rabbitmq_url);

// amqplib rejects with an empty message on a refused connection, so the code is used instead
const describeError = (err: unknown) => {
  const error = err as { message?: string; code?: string };

  return error?.message || error?.code || 'unknown connection error';
};

// retry queues dead letter back into the main queue once their ttl expires
const setupTopology = async (ch: Channel) => {
  await ch.assertExchange(MQ_EXCHANGE, 'direct', { durable: true });

  await ch.assertQueue(MQ_QUEUES.notificationDlq, { durable: true });
  await ch.bindQueue(
    MQ_QUEUES.notificationDlq,
    MQ_EXCHANGE,
    MQ_ROUTING_KEYS.notificationDead,
  );

  await ch.assertQueue(MQ_QUEUES.notificationPush, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': MQ_EXCHANGE,
      'x-dead-letter-routing-key': MQ_ROUTING_KEYS.notificationDead,
    },
  });
  await ch.bindQueue(
    MQ_QUEUES.notificationPush,
    MQ_EXCHANGE,
    MQ_ROUTING_KEYS.notificationPush,
  );

  for (let index = 0; index < MQ_QUEUES.notificationRetry.length; index += 1) {
    await ch.assertQueue(MQ_QUEUES.notificationRetry[index], {
      durable: true,
      arguments: {
        'x-message-ttl': MQ_RETRY_DELAYS[index],
        'x-dead-letter-exchange': MQ_EXCHANGE,
        'x-dead-letter-routing-key': MQ_ROUTING_KEYS.notificationPush,
      },
    });
    await ch.bindQueue(
      MQ_QUEUES.notificationRetry[index],
      MQ_EXCHANGE,
      MQ_QUEUES.notificationRetry[index],
    );
  }
};

const resetConnection = () => {
  connection = null;
  channel = null;
};

const scheduleReconnect = () => {
  if (reconnectTimer || !isQueueEnabled()) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void getChannel();
  }, RECONNECT_DELAY_MS);
};

const getChannel = async (): Promise<Channel | null> => {
  // a broker that just refused a connection is not retried on every request
  if (!isQueueEnabled() || Date.now() < cooldownUntil) return null;
  if (channel) return channel;

  if (!connecting) {
    connecting = (async () => {
      try {
        const activeConnection = await amqp.connect(
          config.rabbitmq_url as string,
        );
        connection = activeConnection;

        activeConnection.on('error', (err: Error) => {
          console.error('[message-queue] connection error:', err.message);
          resetConnection();
        });
        activeConnection.on('close', () => resetConnection());

        const activeChannel = await activeConnection.createChannel();
        activeChannel.on('error', (err: Error) =>
          console.error('[message-queue] channel error:', err.message),
        );

        await setupTopology(activeChannel);
        channel = activeChannel;
        console.log('[message-queue] rabbitmq channel is ready');

        return activeChannel;
      } catch (err) {
        cooldownUntil = Date.now() + RECONNECT_DELAY_MS;
        console.error(
          `[message-queue] rabbitmq is unavailable, retrying in ${RECONNECT_DELAY_MS / 1000}s:`,
          describeError(err),
        );
        scheduleReconnect();
        return null;
      } finally {
        connecting = null;
      }
    })();
  }

  return connecting;
};

export const publishTask = async <T>(
  queue: string,
  payload: T,
  options: {
    key?: string;
    correlationId?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<boolean> => {
  const activeChannel = await getChannel();
  if (!activeChannel) return false;

  const envelope = buildEventEnvelope(queue, payload, {
    correlationId: options.correlationId,
  });

  try {
    return activeChannel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(envelope)),
      {
        persistent: true,
        contentType: 'application/json',
        contentEncoding: 'utf-8',
        messageId: envelope.eventId,
        correlationId: envelope.correlationId,
        timestamp: Date.now(),
        headers: {
          eventId: envelope.eventId,
          correlationId: envelope.correlationId,
          'x-retry-count': 0,
          ...options.headers,
        },
      },
    );
  } catch (err) {
    console.error(
      `[message-queue] failed to publish to ${queue}:`,
      (err as Error).message,
    );
    return false;
  }
};

export type TTaskHandler<T> = (
  payload: T,
  envelope: TEventEnvelope<T>,
  message: ConsumeMessage,
) => Promise<void>;

const processTask = async <T>(
  activeChannel: Channel,
  queue: string,
  message: ConsumeMessage | null,
  handler: TTaskHandler<T>,
  retryQueues: string[],
  deadLetterRoutingKey: string,
) => {
  if (!message) return;

  const retryCount = Number(
    message.properties.headers?.['x-retry-count']?.toString() ?? 0,
  );

  try {
    const envelope = JSON.parse(
      message.content.toString(),
    ) as TEventEnvelope<T>;
    await handler(envelope.payload, envelope, message);
    activeChannel.ack(message);
  } catch (err) {
    const reason = (err as Error).message;
    console.error(
      `[message-queue] task failed on ${queue} (attempt ${retryCount + 1}):`,
      reason,
    );

    try {
      const options = {
        persistent: true,
        contentType: message.properties.contentType,
        messageId: message.properties.messageId,
        correlationId: message.properties.correlationId,
        timestamp: message.properties.timestamp,
        headers: {
          ...message.properties.headers,
          'x-retry-count': retryCount + 1,
          'x-last-error': reason,
          'x-failed-at': new Date().toISOString(),
        },
      };

      if (retryCount < retryQueues.length) {
        // parked in a retry queue, its ttl dead letters the message back to the main queue
        activeChannel.publish(
          MQ_EXCHANGE,
          retryQueues[retryCount],
          message.content,
          options,
        );
      } else {
        activeChannel.publish(
          MQ_EXCHANGE,
          deadLetterRoutingKey,
          message.content,
          options,
        );
      }
    } finally {
      activeChannel.ack(message);
    }
  }
};

export const consumeTasks = async <T>(
  queue: string,
  handler: TTaskHandler<T>,
  options: {
    prefetch?: number;
    retryQueues?: string[];
    deadLetterRoutingKey?: string;
  } = {},
): Promise<Channel | null> => {
  const activeChannel = await getChannel();
  if (!activeChannel) return null;

  await activeChannel.prefetch(options.prefetch ?? 5);

  const retryQueues = options.retryQueues ?? MQ_QUEUES.notificationRetry;
  const deadLetterRoutingKey =
    options.deadLetterRoutingKey ?? MQ_ROUTING_KEYS.notificationDead;

  await activeChannel.consume(
    queue,
    (message) => {
      void processTask(
        activeChannel,
        queue,
        message,
        handler,
        retryQueues,
        deadLetterRoutingKey,
      );
    },
    { noAck: false },
  );

  return activeChannel;
};

export const closeMessageQueue = async () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  try {
    if (channel) await channel.close();
  } catch (err) {
    console.error(
      '[message-queue] channel close failed:',
      (err as Error).message,
    );
  }

  try {
    if (connection) await connection.close();
  } catch (err) {
    console.error(
      '[message-queue] connection close failed:',
      (err as Error).message,
    );
  }

  resetConnection();
};
