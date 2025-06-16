const Joi = require('joi');

/**
 * Custom validation for password
 * Password must contain at least one uppercase letter, one lowercase letter,
 * one number and one special character
 */
const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.error('password.min', { message: 'password must be at least 8 characters' });
  }
  if (!value.match(/\d/) || !value.match(/[a-z]/) || !value.match(/[A-Z]/) || !value.match(/[^a-zA-Z0-9]/)) {
    return helpers.error('password.pattern', {
      message: 'password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    });
  }
  return value;
};

/**
 * Custom validation for phone number
 * Must be a valid Indian phone number
 */
const phoneNumber = (value, helpers) => {
  if (!value.match(/^[6-9]\d{9}$/)) {
    return helpers.error('phoneNumber.invalid', {
      message: 'must be a valid Indian phone number',
    });
  }
  return value;
};

/**
 * Custom validation for PAN number
 * Must be a valid Indian PAN number
 */
const panNumber = (value, helpers) => {
  if (!value.match(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)) {
    return helpers.error('panNumber.invalid', {
      message: 'must be a valid Indian PAN number',
    });
  }
  return value;
};

/**
 * Custom validation for GST number
 * Must be a valid Indian GST number
 */
const gstNumber = (value, helpers) => {
  if (!value.match(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)) {
    return helpers.error('gstNumber.invalid', {
      message: 'must be a valid Indian GST number',
    });
  }
  return value;
};

/**
 * Custom validation for IFSC code
 * Must be a valid Indian IFSC code
 */
const ifscCode = (value, helpers) => {
  if (!value.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
    return helpers.error('ifscCode.invalid', {
      message: 'must be a valid Indian IFSC code',
    });
  }
  return value;
};

/**
 * Custom validation for Aadhaar number
 * Must be a valid Indian Aadhaar number
 */
const aadhaarNumber = (value, helpers) => {
  if (!value.match(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/)) {
    return helpers.error('aadhaarNumber.invalid', {
      message: 'must be a valid Indian Aadhaar number',
    });
  }
  return value;
};

/**
 * Custom validation for date
 * Must be a valid date and not in the future
 */
const date = (value, helpers) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return helpers.error('date.invalid', {
      message: 'must be a valid date',
    });
  }
  if (date > new Date()) {
    return helpers.error('date.future', {
      message: 'date cannot be in the future',
    });
  }
  return value;
};

/**
 * Custom validation for amount
 * Must be a positive number with up to 2 decimal places
 */
const amount = (value, helpers) => {
  if (value <= 0) {
    return helpers.error('amount.positive', {
      message: 'amount must be positive',
    });
  }
  if (!value.toString().match(/^\d+(\.\d{1,2})?$/)) {
    return helpers.error('amount.decimal', {
      message: 'amount must have up to 2 decimal places',
    });
  }
  return value;
};

// Add custom validation rules to Joi
const customJoi = Joi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'password.min': '{{#label}} must be at least {{#limit}} characters',
    'password.pattern': '{{#label}} must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    'phoneNumber.invalid': '{{#label}} must be a valid Indian phone number',
    'panNumber.invalid': '{{#label}} must be a valid Indian PAN number',
    'gstNumber.invalid': '{{#label}} must be a valid Indian GST number',
    'ifscCode.invalid': '{{#label}} must be a valid Indian IFSC code',
    'aadhaarNumber.invalid': '{{#label}} must be a valid Indian Aadhaar number',
    'date.invalid': '{{#label}} must be a valid date',
    'date.future': '{{#label}} cannot be in the future',
    'amount.positive': '{{#label}} must be positive',
    'amount.decimal': '{{#label}} must have up to 2 decimal places',
  },
  rules: {
    password: {
      validate(value, helpers) {
        return password(value, helpers);
      },
    },
    phoneNumber: {
      validate(value, helpers) {
        return phoneNumber(value, helpers);
      },
    },
    panNumber: {
      validate(value, helpers) {
        return panNumber(value, helpers);
      },
    },
    gstNumber: {
      validate(value, helpers) {
        return gstNumber(value, helpers);
      },
    },
    ifscCode: {
      validate(value, helpers) {
        return ifscCode(value, helpers);
      },
    },
    aadhaarNumber: {
      validate(value, helpers) {
        return aadhaarNumber(value, helpers);
      },
    },
    date: {
      validate(value, helpers) {
        return date(value, helpers);
      },
    },
    amount: {
      validate(value, helpers) {
        return amount(value, helpers);
      },
    },
  },
}));

module.exports = {
  password,
  phoneNumber,
  panNumber,
  gstNumber,
  ifscCode,
  aadhaarNumber,
  date,
  amount,
  customJoi,
}; 