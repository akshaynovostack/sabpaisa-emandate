const { Client } = require('pg');
const config = require('./config');
const logger = require('./logger');

let client;

(async function name() {
  client = new Client(config.sqlDB);
  try {
    await client.connect();
    logger.info('Connect to postgres successfully');
    return client;
  } catch (error) {
    logger.error('Connect to postgres error');
    process.exit(1);
  }
})();

module.exports = {
  postgres: client,
}; 