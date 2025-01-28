const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../helpers/logger');

const createUserMandate = async (data) => {
  return await Prisma.usermandate.create({ data });
};

const getUserMandate = async (id) => {
  return await prisma.usermandate.findUnique({ where: { id: parseInt(id) } });
};

const updateUserMandate = async (id, data) => {
  return await prisma.usermandate.update({ where: { id: parseInt(id) }, data });
};

const deleteUserMandate = async (id) => {
  return await prisma.usermandate.delete({ where: { id: parseInt(id) } });
};

// Save user mandate
const saveUserMandate = async (data) => {
  try {
    logger.info('Saving user mandate details:', data);
    return await prisma.userMandate.create({
      data,
    });
  } catch (error) {
    logger.error('Error in saveUserMandate:', error);
    throw error;
  }
};

module.exports = {
  createUserMandate,
  getUserMandate,
  updateUserMandate,
  deleteUserMandate,
  saveUserMandate
};