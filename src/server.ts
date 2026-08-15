import mongoose from 'mongoose';
import config from './app/config';
import app from './app';
import { Server } from 'http';
import { disconnectEventBus } from './app/utils/eventBus';
import { closeMessageQueue } from './app/utils/messageQueue';
import { disconnectRedis } from './app/utils/redis';

let server: Server;

// kafka consumers and the rabbitmq delivery worker are started next to the http server
async function startEventDrivenWorkers() {
  if (config.kafka_brokers) {
    try {
      const { startAuditConsumer } = await import(
        './app/consumers/auditConsumer'
      );
      const { startFeeConsumer } = await import('./app/consumers/feeConsumer');
      const { startDlqConsumer } = await import('./app/consumers/dlqConsumer');

      await Promise.all([
        startAuditConsumer(),
        startFeeConsumer(),
        startDlqConsumer(),
      ]);
    } catch (err) {
      console.log(
        'The kafka consumers could not be started:',
        (err as Error).message,
      );
    }
  } else {
    console.log(
      'KAFKA_BROKERS is not configured, the kafka consumers are disabled',
    );
  }

  if (config.rabbitmq_url) {
    try {
      const { startNotificationConsumer } = await import(
        './app/consumers/notificationConsumer'
      );

      await startNotificationConsumer();
    } catch (err) {
      console.log(
        'The notification worker could not be started:',
        (err as Error).message,
      );
    }
  } else {
    console.log(
      'RABBITMQ_URL is not configured, the notification worker is disabled',
    );
  }
}

async function main() {
  try {
    // console.log("DATABASE_URL:", config.database_url); //  Debuging

    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`Application is listening on port ${config.port}`);
    });

    await startEventDrivenWorkers();
  } catch (err) {
    console.log(err);
  }
}

main();

// every connection is closed before the process goes away
const gracefulShutdown = async (exitCode: number) => {
  if (server) {
    server.close();
  }

  await disconnectEventBus();
  await closeMessageQueue();
  await disconnectRedis();

  try {
    await mongoose.connection.close();
  } catch (err) {
    console.log(
      'The database connection could not be closed:',
      (err as Error).message,
    );
  }

  process.exit(exitCode);
};

process.on('unhandledRejection', () => {
  console.log(`UnhandledRejection is detected, shutting down.....`);
  void gracefulShutdown(1);
});

process.on('uncaughtException', () => {
  console.log(`UncaughtException is detected, shutting down.....`);
  void gracefulShutdown(1);
});

process.on('SIGTERM', () => {
  console.log(`SIGTERM is received, shutting down gracefully.....`);
  void gracefulShutdown(0);
});

process.on('SIGINT', () => {
  console.log(`SIGINT is received, shutting down gracefully.....`);
  void gracefulShutdown(0);
});
