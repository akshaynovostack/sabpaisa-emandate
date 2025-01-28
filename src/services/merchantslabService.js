const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const createMerchantSlab = async (data) => {
  return await prisma.merchantslab.create({ data });
};

const getMerchantSlab = async (id) => {
  return await prisma.merchantslab.findUnique({ where: { id: parseInt(id) } });
};

const updateMerchantSlab = async (id, data) => {
  return await prisma.merchantslab.update({ where: { id: parseInt(id) }, data });
};

const deleteMerchantSlab = async (id) => {
  return await prisma.merchantslab.delete({ where: { id: parseInt(id) } });
};

module.exports = {
  createMerchantSlab,
  getMerchantSlab,
  updateMerchantSlab,
  deleteMerchantSlab,
};