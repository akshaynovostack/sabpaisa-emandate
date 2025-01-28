const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../helpers/logger');
const { v4: uuidv4 } = require('uuid');

const createUser = async (data) => {
  return await prisma.user.create({ data });
};

const getUser = async (id) => {
  return await prisma.user.findUnique({ where: { id: parseInt(id) } });
};

const updateUser = async (id, data) => {
  return await prisma.user.update({ where: { id: parseInt(id) }, data });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({ where: { id: parseInt(id) } });
};

const saveOrUpdateUser = async (data) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email },
    });
    if (existingUser) {
      logger.info(`Updating user: ${existingUser.user_id}`);
      return await prisma.user.update({
        where: { user_id: existingUser.user_id },
        data: {
          name: data.name,
          mobile: data.mobile,
          pan: data.pan || existingUser.pan,
          telephone: data.telephone || existingUser.telephone
        },
      });
    } else {
      logger.info('Creating new user');
      const customerId = data.customerId || uuidv4(); // Generate a new customer_id if not provided
      return await prisma.user.create({
        data: {
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          pan: data.pan || "",
          telephone: data.telephone || "",
          user_id: customerId, // Save the generated or provided customer_id
        },
      });
    }
  } catch (error) {
    logger.error('Error in saveOrUpdateUser:', error);
    throw error;
  }
};


module.exports = {
  saveOrUpdateUser,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};