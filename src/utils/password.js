const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
const comparePassword = async (password, hash) => {
  try {
    return bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Error comparing password');
  }
};

module.exports = {
  hashPassword,
  comparePassword,
}; 