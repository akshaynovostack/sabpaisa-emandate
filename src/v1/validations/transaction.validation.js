const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Common validation rules
const amountValidation = Joi.string().pattern(/^\d+(\.\d{1,2})?$/).required();
const dateValidation = Joi.date().iso().required();

const createTransaction = {
  body: Joi.object().keys({
    client_transaction_id: Joi.string().required(),
    user_id: Joi.string().required(),
    merchant_id: Joi.string().required(),
    monthly_emi: amountValidation,
    start_date: dateValidation,
    end_date: dateValidation.min(Joi.ref('start_date')),
    purpose: Joi.string().required(),
    max_amount: amountValidation,
    amount: amountValidation,
    sabpaisa_txn_id: Joi.string(),
  }),
};

const getTransactions = {
  query: Joi.object().keys({
    user_id: Joi.string(),
    merchant_id: Joi.string(),
    client_transaction_id: Joi.string(),
    sabpaisa_txn_id: Joi.string(),
    status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'),
    date_range: Joi.object().keys({
      start: Joi.date().iso(),
      end: Joi.date().iso().min(Joi.ref('start')),
    }),
    amount_range: Joi.object().keys({
      min: Joi.number().positive(),
      max: Joi.number().positive().min(Joi.ref('min')),
    }),
    search: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().required(),
  }),
};

const updateTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      monthly_emi: amountValidation,
      start_date: dateValidation,
      end_date: dateValidation.min(Joi.ref('start_date')),
      purpose: Joi.string(),
      max_amount: amountValidation,
      amount: amountValidation,
      sabpaisa_txn_id: Joi.string(),
      status: Joi.string().valid('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'),
    })
    .min(1),
};

const deleteTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().required(),
  }),
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
}; 