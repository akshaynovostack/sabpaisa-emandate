const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./helpers/logger');
const routesV1 = require('./v1/routes');
const path = require('path');
const { decAESString } = require('./helpers/common-helper');

// Initialize environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware setup
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }));
// Set the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use routes


// Middleware to capture request details
app.use((req, res, next) => {
  // Get the client's IP address
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Get the User-Agent (browser or device info)
  const userAgent = req.get('User-Agent');
  
  // Capture additional headers if needed (Referer, Accept-Language, etc.)
  const referer = req.get('Referer');
  const acceptLanguage = req.get('Accept-Language');
  const method = req.method;
  const url = req.originalUrl;

  // Capture the start time for response time tracking
  const startTime = Date.now();

  // Log the incoming request
  logger.info('Request received', {
    ip: clientIp,
    userAgent: userAgent,
    referer: referer,
    acceptLanguage: acceptLanguage,
    method: method,
    url: url,
  });

  // Capture the response once it's finished
  res.on('finish', () => {
    const responseTime = Date.now() - startTime; // Calculate response time
    const statusCode = res.statusCode; // Get the response status code

    // Log the response details
    logger.info('Response sent', {
      ip: clientIp,
      userAgent: userAgent,
      method: method,
      url: url,
      statusCode: statusCode,
      responseTime: responseTime, // Time taken to process the request
    });
  });

  next(); // Pass control to the next middleware or route handler
});
// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unexpected Error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});
app.use('/v1', routesV1);
// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
