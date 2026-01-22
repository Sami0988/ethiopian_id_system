export const fastifyEnvSchema = {
  type: 'object',
  required: [
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
  ],
  properties: {
    // Application
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'production', 'test'],
      default: 'development',
    },
    APP_NAME: { type: 'string', default: 'NexusQR SaaS' },
    APP_PORT: { type: 'integer', default: 3000 },
    APP_HOST: { type: 'string', default: '0.0.0.0' },
    APP_URL: { type: 'string', default: 'http://localhost:3000' },
    API_PREFIX: { type: 'string', default: '/api/v1' },
    CORS_ORIGIN: { type: 'string', default: '*' },

    // Logging
    LOG_LEVEL: {
      type: 'string',
      enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
    },
    LOG_PRETTY: { type: 'boolean', default: false },

    // Database (PostgreSQL)
    DB_HOST: { type: 'string', default: 'localhost' },
    DB_PORT: { type: 'integer', default: 5432 },
    DB_USERNAME: { type: 'string' },
    DB_PASSWORD: { type: 'string' },
    DB_DATABASE: { type: 'string' },
    DB_SSL: { type: 'boolean', default: false },

    // Admin Registeration secret
    ADMIN_REGISTER_SECRET: {
      type: 'string',
      description: 'Secret key for registering the first admin user',
      minLength: 32,
    },

    // Authentication
    JWT_ACCESS_SECRET: { type: 'string', minLength: 32 },
    JWT_ACCESS_EXPIRY: { type: 'string', default: '15m' },
    JWT_REFRESH_SECRET: { type: 'string', minLength: 32 },
    JWT_REFRESH_EXPIRY: { type: 'string', default: '30d' },
    COOKIE_SECRET: { type: 'string' },

    // Redis (Cache & BullMQ)
    REDIS_URL: { type: 'string' },
    REDIS_HOST: { type: 'string', default: 'localhost' },
    REDIS_PORT: { type: 'integer', default: 6379 },
    REDIS_PASSWORD: { type: 'string' },
    REDIS_DB: { type: 'integer', default: 0 },
    REDIS_MAX_CONNECTIONS: { type: 'integer', default: 10 },
    REDIS_TLS_ENABLED: { type: 'boolean', default: false },

    // MinIO / S3 Storage
    MINIO_ENDPOINT: { type: 'string' },
    MINIO_PORT: { type: 'integer' },
    MINIO_USE_SSL: { type: 'boolean', default: false },
    MINIO_ACCESS_KEY: { type: 'string' },
    MINIO_SECRET_KEY: { type: 'string' },
    MINIO_BUCKET_NAME: { type: 'string' },

    // Email (SMTP)
    SMTP_HOST: { type: 'string' },
    SMTP_PORT: { type: 'integer' },
    SMTP_USER: { type: 'string' },
    SMTP_PASS: { type: 'string' },
    SMTP_SECURE: { type: 'boolean', default: false },
    EMAIL_FROM_NAME: { type: 'string', default: 'NexusQR' },
    EMAIL_FROM_ADDRESS: { type: 'string' },
    EMAIL_ALLOW_SEND: { type: 'boolean', default: false },

    // Ethiopian Payment Providers
    CHAPA_SECRET_KEY: { type: 'string' },
    TELEBIRR_API_KEY: { type: 'string' },
    TELEBIRR_SHORT_CODE: { type: 'string' },

    // Payment Config Encryption
    PAYMENT_CONFIG_ENCRYPTION_KEY: { 
      type: 'string',
      description: 'AES-256 encryption key for payment provider configs (64 hex characters)',
      default: "aes-256-encritpiton-qw0923490245823=-12-40-23040234"
    },

    // Rate Limiting
    RATE_LIMIT_TTL: { type: 'integer', default: 60000 },
    RATE_LIMIT_MAX: { type: 'integer', default: 100 },
  },
} as const;

// TypeScript interface for type-safe access
export interface EnvConfig {
  // Application
  NODE_ENV: 'development' | 'production' | 'test';
  APP_NAME: string;
  APP_PORT: number;
  APP_HOST: string;
  APP_URL: string;
  API_PREFIX: string;
  CORS_ORIGIN: string;

  // Admin
  ADMIN_REGISTER_SECRET: string;

  // Logging
  LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  LOG_PRETTY: boolean;

  // Database (PostgreSQL)
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_SSL: boolean;

  // Authentication
  // Authentication
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRY: string;
  COOKIE_SECRET?: string;

  // Redis (Cache & BullMQ)
  REDIS_URL?: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  REDIS_MAX_CONNECTIONS: number;
  REDIS_TLS_ENABLED: boolean;

  // MinIO / S3 Storage
  MINIO_ENDPOINT?: string;
  MINIO_PORT?: number;
  MINIO_USE_SSL: boolean;
  MINIO_ACCESS_KEY?: string;
  MINIO_SECRET_KEY?: string;
  MINIO_BUCKET_NAME?: string;

  // Email (SMTP)
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_SECURE: boolean;
  EMAIL_FROM_NAME: string;
  EMAIL_FROM_ADDRESS?: string;
  EMAIL_ALLOW_SEND: boolean;

  // Ethiopian Payment Providers
  CHAPA_SECRET_KEY?: string;
  TELEBIRR_API_KEY?: string;
  TELEBIRR_SHORT_CODE?: string;

  // Payment Config Encryption
  PAYMENT_CONFIG_ENCRYPTION_KEY?: string;

  // Rate Limiting
  RATE_LIMIT_TTL: number;
  RATE_LIMIT_MAX: number;
}
