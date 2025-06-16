const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {status: httpStatus} = require('http-status');
const { PrismaClient } = require('@prisma/client');
const config = require('./config/config');
const morgan = require('./config/morgan');
const jwt = require('./config/jwt');
const { apiLimiter, authLimiter, sensitiveLimiter } = require('./v1/middlewares/rateLimiter');
const routes = require('./v1/routes');
const errorMiddleware = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const logger = require('./config/logger');

// Initialize Prisma client
const prisma = new PrismaClient();

const app = express();

// Logging middleware in non-test environment
if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: config.env === 'production' ? undefined : false,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(xss());

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutes
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Cookie parsing
app.use(cookieParser());

// JWT authentication
app.use(jwt());

// Database connection middleware
app.use((req, _, next) => {
  req.prisma = prisma;
  next();
});

// Apply rate limiting
app.use('/v1', apiLimiter);
app.use('/v1/auth', authLimiter);
app.use('/v1/merchants', sensitiveLimiter);
app.use('/v1/transactions', sensitiveLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(httpStatus.OK).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/v1', routes);

// Swagger documentation route
if (config.env !== 'production') {
  app.use('/v1/docs', require('./v1/routes/docs.route'));
}

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Error handling middleware
app.use(errorMiddleware);

// Handle Prisma connection errors
prisma.$on('query', (e) => {
  logger.debug('Query: ' + e.query);
  logger.debug('Duration: ' + e.duration + 'ms');
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal');
  try {
    await prisma.$disconnect();
    logger.info('Prisma client disconnected');
  } catch (error) {
    logger.error('Error during Prisma disconnection:', error);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app; 