import mongoose from 'mongoose';
import type { IncomingMessage, ServerResponse } from 'http';
import app from '../app';
import config from '../app/config';

// the connection is cached on the module scope so warm lambda invocations reuse it
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose._mongooseCache ?? {
  conn: null,
  promise: null,
};

globalWithMongoose._mongooseCache = cached;

const connectToDatabase = async (): Promise<typeof mongoose> => {
  // a live connection is reused across invocations
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 10,
      // serverless invocations must fail fast instead of buffering commands indefinitely
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    // a failed attempt must not be cached, otherwise every later request reuses the rejection
    cached.promise = null;
    throw err;
  }
};

// the express app is a request handler, this thin wrapper only guarantees a database
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    await connectToDatabase();
  } catch (err) {
    const message = (err as Error).message;
    console.error('[serverless] database connection failed:', message);

    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        message: 'The service is temporarily unavailable',
        errorSources: [{ path: '', message: 'Database connection failed' }],
      }),
    );
    return;
  }

  (
    app as unknown as (
      request: IncomingMessage,
      response: ServerResponse,
    ) => void
  )(req, res);
}
