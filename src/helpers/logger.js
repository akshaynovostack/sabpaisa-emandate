// logger.js

const { createLogger, format, transports } = require('winston');
const { trace } = require('@opentelemetry/api');
const path = require('path');
const fs = require('fs');

// Ensure that the log directory exists
const logDirectory = path.join(__dirname, '../logs');
const logFile = path.join(logDirectory, 'combined.log');

// Create the log directory if it doesn't exist
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

// Helper function to handle circular references
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };
};

// Define the logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.printf(({ level, message, timestamp, ...meta }) => {
      const activeSpan = trace.getActiveSpan();
      const spanContext = activeSpan ? activeSpan.spanContext() : null;
      const traceId = spanContext ? spanContext.traceId : 'no-trace';
      
      // Safely stringify the object using the circular replacer
      return JSON.stringify(
        { timestamp, level, message, traceId, ...meta },
        getCircularReplacer()
      );
    })
  ),
  transports: [
    new transports.File({
      filename: logFile,
      level: 'debug',
    }),
    new transports.Console({
      level: 'warn',
    }),
  ],
});

module.exports = logger; // Export the logger
