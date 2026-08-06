import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BYCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASS,

  // authentication : secrets must be supplied through the environment in production
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // interactive demo sandbox : reviewers log in with the seeded demo accounts
  demo_password: process.env.DEMO_PASSWORD || 'Demo@123',

  // comma separated list of allowed origins, an empty list allows every origin
  cors_origins: process.env.CORS_ORIGINS,

  kafka_brokers: process.env.KAFKA_BROKERS,
  kafka_client_id: process.env.KAFKA_CLIENT_ID || 'hostel-management',
  rabbitmq_url: process.env.RABBITMQ_URL,
  redis_url: process.env.REDIS_URL,
  audit_log_ttl_days: process.env.AUDIT_LOG_TTL_DAYS,
  razorpay_webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
};
