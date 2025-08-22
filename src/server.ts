import mongoose from 'mongoose';
import config from './app/config';
import app from './app';
import { Server } from 'http'

let server: Server;

async function main() {
  try {
    // console.log("DATABASE_URL:", config.database_url); //  Debuging

    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`Application is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', () => {
  console.log(`UnhandledRejection is detected, shutting down.....`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`UncaughtException is detected, shutting down.....`);
  process.exit(1);
});