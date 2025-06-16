const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  api: {
    prefix: process.env.API_PREFIX || '/v1',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 10) || 30,
    refreshExpirationDays: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS, 10) || 30,
    refreshCookieName: process.env.JWT_REFRESH_COOKIE_NAME || 'refreshToken',
    issuer: process.env.JWT_ISSUER || 'emandate-api',
    audience: process.env.JWT_AUDIENCE || 'emandate-client',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET,
    expirationHours: parseInt(process.env.COOKIE_EXPIRATION_HOURS, 10) || 24,
  },
  db: {
    url: process.env.DATABASE_URL,
    username: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE_NAME,
    host: process.env.SQL_HOST,
    port: parseInt(process.env.SQL_PORT, 10) || 3306,
    dialect: 'mysql',
    pool: {
      max: parseInt(process.env.SQL_MAX_POOL, 10) || 10,
      min: parseInt(process.env.SQL_MIN_POOL, 10) || 0,
      acquire: parseInt(process.env.SQL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.SQL_IDLE, 10) || 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'dev',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // 100 requests per window
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
    passwordMaxLength: parseInt(process.env.PASSWORD_MAX_LENGTH, 10) || 30,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'SQL_USERNAME',
  'SQL_PASSWORD',
  'SQL_DATABASE_NAME',
  'SQL_HOST',
  'SMTP_HOST',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'EMAIL_FROM',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Validate environment-specific configurations
if (config.env === 'production') {
  if (config.cors.origin === '*') {
    throw new Error('CORS_ORIGIN must be set in production');
  }
  if (!config.cookie.secret) {
    throw new Error('COOKIE_SECRET must be set in production');
  }
  if (config.db.pool.max < 5) {
    throw new Error('SQL_MAX_POOL must be at least 5 in production');
  }
}

module.exports = config; 