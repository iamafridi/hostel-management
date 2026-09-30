import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import httpStatus from 'http-status';
import config from './app/config';
import audit from './app/middlewares/audit';
import { attachUser } from './app/middlewares/auth';
import demoGuard from './app/middlewares/demoGuard';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// Parser
// the raw body is kept around so webhook signatures can be verified against it
app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as Request & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);

// comma separated allow-list, an unset list keeps the api open for local tooling
const allowedOrigins = (config.cors_origins ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// supports exact origins plus wildcard entries such as https://*.vercel.app
const isOriginAllowed = (origin: string) =>
  allowedOrigins.length === 0 ||
  allowedOrigins.some((allowed) => {
    if (allowed === origin) return true;
    if (!allowed.includes('*')) return false;

    const pattern = `^${allowed.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`;
    return new RegExp(pattern).test(origin);
  });

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // same-origin, server-to-server and curl requests arrive without an origin
    if (!origin || isOriginAllowed(origin)) {
      return callback(null, true);
    }

    return callback(new Error('This origin is not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// decodes the bearer token when present so downstream middleware can see the caller
app.use(attachUser);

// Audit trail for every mutating request
app.use(audit);

// demo accounts may read everything but can not modify the shared sandbox
app.use(demoGuard);

// Application Routes
app.use('/api/v1', router);

app.get('/health', (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Service is healthy',
    data: { uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
});

const test = (req: Request, res: Response) => {
  res.send('Hello World!');
};

app.get('/', test);

//Global err handler
app.use(globalErrorHandler);
// Not Found
app.use(notFound);

export default app;
