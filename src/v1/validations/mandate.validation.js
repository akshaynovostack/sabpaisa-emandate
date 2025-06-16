const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Custom validation for mandateId
const mandateId = Joi.string().custom((value, helpers) => {
  if (!/^\d+$/.test(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'mandateId validation');

const createMandate = {
  body: Joi.object().keys({
    transaction_id: Joi.string().required(),
    user_id: Joi.string().required(),
    amount: Joi.number().required(),
    due_date: Joi.date().required(),
    bank_account_number: Joi.string().required(),
    bank_account_type: Joi.string().required(),
    bank_name: Joi.string().required(),
    bank_ifsc: Joi.string().required(),
    frequency: Joi.string().valid('ADHO', 'DAIL', 'WEEK', 'MNTH', 'QURT', 'MIAN', 'YEAR', 'BIMN', 'OOFF', 'RCUR').required(),
    registration_status: Joi.string().valid('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED').default('PENDING'),
    bank_status_message: Joi.string().allow('', null),
    paid_date: Joi.date().allow(null),
  }),
};

const getMandates = {
  query: Joi.object().keys({
    search: Joi.string(),
    user_id: Joi.string(),
    transaction_id: Joi.string(),
    registration_status: Joi.string().valid('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED'),
    bank_status_message: Joi.string(),
    date_range: Joi.object({
      start: Joi.date().required(),
      end: Joi.date().required().min(Joi.ref('start')),
    }),
    amount_range: Joi.object({
      min: Joi.number().required(),
      max: Joi.number().required().min(Joi.ref('min')),
    }),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getMandate = {
  params: Joi.object().keys({
    mandateId: mandateId.required(),
  }),
};

const updateMandate = {
  params: Joi.object().keys({
    mandateId: mandateId.required(),
  }),
  body: Joi.object()
    .keys({
      amount: Joi.number(),
      due_date: Joi.date(),
      bank_account_number: Joi.string(),
      bank_account_type: Joi.string(),
      bank_name: Joi.string(),
      bank_ifsc: Joi.string(),
      frequency: Joi.string().valid('ADHO', 'DAIL', 'WEEK', 'MNTH', 'QURT', 'MIAN', 'YEAR', 'BIMN', 'OOFF', 'RCUR'),
      registration_status: Joi.string().valid('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED'),
      bank_status_message: Joi.string().allow('', null),
      paid_date: Joi.date().allow(null),
    })
    .min(1),
};

const deleteMandate = {
  params: Joi.object().keys({
    mandateId: mandateId.required(),
  }),
};

module.exports = {
  createMandate,
  getMandates,
  getMandate,
  updateMandate,
  deleteMandate,
}; 