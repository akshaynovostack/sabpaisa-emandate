const usermandateService = require('../../services/usermandateService');
const logger = require('../../helpers/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment')

const createUserMandate = async (req, res) => {
  try {
    const usermandate = await usermandateService.createUserMandate(req.body);
    logger.info('UserMandate created successfully', { id: usermandate.id });
    res.status(201).json(usermandate);
  } catch (error) {
    logger.error('Error creating UserMandate', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const getUserMandate = async (req, res) => {
  try {
    const usermandate = await usermandateService.getUserMandate(req.params.id);
    if (!usermandate) {
      logger.warn('UserMandate not found', { id: req.params.id });
      return res.status(404).json({ message: 'UserMandate not found' });
    }
    logger.info('UserMandate retrieved successfully', { id: req.params.id });
    res.json(usermandate);
  } catch (error) {
    logger.error('Error retrieving UserMandate', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const updateUserMandate = async (req, res) => {
  try {
    const usermandate = await usermandateService.updateUserMandate(req.params.id, req.body);
    logger.info('UserMandate updated successfully', { id: req.params.id });
    res.json(usermandate);
  } catch (error) {
    logger.error('Error updating UserMandate', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const deleteUserMandate = async (req, res) => {
  try {
    await usermandateService.deleteUserMandate(req.params.id);
    logger.info('UserMandate deleted successfully', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting UserMandate', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const createOrUpdateUserMandate = async (mandateData) => {
  try {
    const { transaction_id, user_id, ...updateFields } = mandateData;

    logger.info('Checking for existing mandate for transaction:', transaction_id);

    const existingMandate = await prisma.user_mandate.findFirst({
      where: {
        transaction: { transaction_id },
      },
    });

    if (existingMandate) {
      logger.info('Updating existing user mandate:', existingMandate);

      const updatedMandate = await prisma.user_mandate.update({
        where: { id: existingMandate.id },
        data: {
          ...updateFields,
          due_date: updateFields.due_date ? new Date(updateFields.due_date) : null,
          paid_date: updateFields.paid_date ? new Date(updateFields.paid_date) : null,
        },
      });

      logger.info('User mandate updated successfully:', updatedMandate);
      return updatedMandate;
    } else {
      logger.info('Creating new user mandate');

      const newMandate = await prisma.user_mandate.create({
        data: {
          transaction: { connect: { transaction_id } },
          user: { connect: { user_id } },
          amount: updateFields.amount,
          due_date: updateFields.due_date ? new Date(updateFields.due_date) : null,
          paid_date: updateFields.paid_date ? new Date(updateFields.paid_date) : null,
          frequency: updateFields.frequency,
          registration_status: updateFields.registration_status,
          bank_status_message: updateFields.bank_status_message,
        },
      });

      logger.info('User mandate created successfully:', newMandate);
      return newMandate;
    }
  } catch (error) {
    logger.error('Error creating or updating user mandate:', error);
    throw error;
  }
};


module.exports = {
  createUserMandate,
  getUserMandate,
  updateUserMandate,
  deleteUserMandate,
  createOrUpdateUserMandate
};