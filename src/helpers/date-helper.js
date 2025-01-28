const moment = require('moment');

/**
 * Calculate start and end dates based on frequency and duration.
 *
 * @param {Date} effectiveDate - The starting date (default is current date).
 * @param {string} frequency - The frequency of the slab (e.g., MNTH, YEAR, etc.).
 * @param {number} duration - The duration in terms of the frequency.
 * @param {Date} expiryDate - A fallback expiry date if duration or frequency is missing.
 * @returns {Object} - An object containing start_date and end_date.
 */
const calculateDates = (effectiveDate, frequency, duration, expiryDate) => {
  const startDate = effectiveDate || new Date();
  let endDate;

  if (duration && frequency) {
    switch (frequency) {
      case 'MNTH': // Monthly
        endDate = moment(startDate).add(duration, 'months').toDate();
        break;
      case 'YEAR': // Yearly
        endDate = moment(startDate).add(duration, 'years').toDate();
        break;
      case 'WEEK': // Weekly
        endDate = moment(startDate).add(duration, 'weeks').toDate();
        break;
      case 'DAIL': // Daily
        endDate = moment(startDate).add(duration, 'days').toDate();
        break;
      default:
        endDate = moment(startDate).add(duration, 'months').toDate(); // Default to months
        break;
    }
  } else {
    endDate = expiryDate || null; // Fallback to expiry date
  }

  return {
    start_date: startDate,
    end_date: endDate,
  };
};

module.exports = { calculateDates };
