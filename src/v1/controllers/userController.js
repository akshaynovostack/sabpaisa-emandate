const userService = require('../../services/userService');
const logger = require('../../helpers/logger');

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    logger.info('User created successfully', { id: user.id });
    res.status(201).json(user);
  } catch (error) {
    logger.error('Error creating User', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userService.getUser(req.params.id);
    if (!user) {
      logger.warn('User not found', { id: req.params.id });
      return res.status(404).json({ message: 'User not found' });
    }
    logger.info('User retrieved successfully', { id: req.params.id });
    res.json(user);
  } catch (error) {
    logger.error('Error retrieving User', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    logger.info('User updated successfully', { id: req.params.id });
    res.json(user);
  } catch (error) {
    logger.error('Error updating User', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    logger.info('User deleted successfully', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting User', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};