const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log queries in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    logger.debug('Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Log errors
prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

// Log warnings
prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e);
});

// Log info
prisma.$on('info', (e) => {
  logger.info('Prisma Info:', e);
});

// Handle process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma Client disconnected');
});

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
  logger.error('Unhandled Rejection:', error);
  await prisma.$disconnect();
  process.exit(1);
});

module.exports = { prisma }; 