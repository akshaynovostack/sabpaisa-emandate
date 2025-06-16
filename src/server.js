const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const logger = require('./config/logger');
const routesV1 = require('./v1/routes');
const path = require('path');
const http = require('http');
const config = require('./config/config');
const errorHandler = require('./middlewares/error');
const { initializeAccessControl } = require('./config/roles');
const { status: httpStatus } = require('http-status');
const ApiError = require('./utils/ApiError');

// Initialize environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Middleware setup
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const { method, originalUrl: url } = req;

  // Log request
  logger.info('Request received', {
    ip: clientIp,
    userAgent,
    method,
    url,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? { id: req.user.id, role: req.user.role_id } : undefined
  });

  // Log response
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.info('Response sent', {
      ip: clientIp,
      method,
      url,
      statusCode: res.statusCode,
      responseTime
    });
  });

  next();
});

// API routes
app.use('/v1', routesV1);

// Handle 404 errors
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});


// Error handling middleware
app.use(errorHandler);

let server;

const startServer = async () => {
  try {
    // Initialize roles and permissions before starting server
    await initializeAccessControl();

    server = http.createServer(app);

    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port} in ${config.env} mode`);
      logger.info(`API Documentation available at http://localhost:${config.port}/v1/docs`);
    });

    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.port === 'string' ? `Pipe ${config.port}` : `Port ${config.port}`;

      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unhandled error:', error);
  exitHandler();
};

// Handle uncaught exceptions
process.on('uncaughtException', unexpectedErrorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  exitHandler();
});

// Handle termination signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  exitHandler();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  exitHandler();
});

// Start the server
startServer();

