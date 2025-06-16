const winston = require('winston');
const config = require('./config');
const path = require('path');
const fs = require('fs');

// Create log directories if they don't exist
const createLogDirectories = () => {
  const logTypes = ['error', 'info', 'success', 'warn'];
  const baseDir = path.join(process.cwd(), 'logs');
  
  // Create base logs directory
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  // Create directories for each log type
  logTypes.forEach(type => {
    const typeDir = path.join(baseDir, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir);
    }
  });
};

// Create directories on startup
createLogDirectories();

// Custom format for log file names
const getLogFileName = (type) => {
  const date = new Date();
  const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const day = String(date.getDate()).padStart(2, '0');
  const dir = path.join(process.cwd(), 'logs', type, monthYear);
  
  // Create month-year directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  return path.join(dir, `${day}.log`);
};

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { 
      message: info.stack,
      error: {
        name: info.name,
        message: info.message,
        stack: info.stack
      }
    });
  }
  return info;
});

// Custom transport for daily rotating files
class DailyRotateTransport extends winston.transports.File {
  constructor(options) {
    const filename = getLogFileName(options.type);
    super({
      ...options,
      filename,
      dirname: path.dirname(filename),
    });
    this.currentFilename = filename;
    this.type = options.type;
  }

  log(info, callback) {
    const newFilename = getLogFileName(this.type);
    
    // If date changed, update the filename
    if (newFilename !== this.currentFilename) {
      this.currentFilename = newFilename;
      this.filename = newFilename;
      this.dirname = path.dirname(newFilename);
    }
    
    super.log(info, callback);
  }
}

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        message: typeof message === 'string' ? message : JSON.stringify(message),
        ...meta
      };
      
      // Add request context if available
      if (meta.req) {
        logEntry.request = {
          method: meta.req.method,
          url: meta.req.url,
          ip: meta.req.ip,
          userAgent: meta.req.get('user-agent'),
          userId: meta.req.user?.id,
          merchantId: meta.req.user?.merchant_id
        };
        delete meta.req;
      }

      // Add response context if available
      if (meta.res) {
        logEntry.response = {
          statusCode: meta.res.statusCode,
          responseTime: meta.res.responseTime
        };
        delete meta.res;
      }

      // Clean up any remaining meta data
      if (Object.keys(meta).length > 0) {
        logEntry.meta = meta;
      }

      return JSON.stringify(logEntry);
    })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      stderrLevels: ['error'],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Error logs
    new DailyRotateTransport({
      type: 'error',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Info logs
    new DailyRotateTransport({
      type: 'info',
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    // Success logs
    new DailyRotateTransport({
      type: 'success',
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
      filter: (info) => info.level === 'info' && info.message.toLowerCase().includes('success'),
    }),
    // Warning logs
    new DailyRotateTransport({
      type: 'warn',
      level: 'warn',
      maxsize: 5242880,
      maxFiles: 5,
    })
  ],
});

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'error' : 
                 res.statusCode >= 300 ? 'warn' : 
                 'success';
    
    logger.log(level, 'Request completed', {
      req,
      res: {
        statusCode: res.statusCode,
        responseTime: duration
      }
    });
  });
  next();
};

// Helper methods for different log types
logger.success = (message, meta = {}) => {
  logger.info(message, { ...meta, logType: 'success' });
};

module.exports = logger; 