const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { mandateService, transactionService, userService } = require('../../services');
const logger = require('../../config/logger');
const { success } = require('../../utils/response');
const moment = require('moment');

/**
 * Get dashboard statistics
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const currentDate = moment();
  const lastMonth = moment().subtract(1, 'month');
  
  // Get current month stats
  const currentMonthStats = await Promise.all([
    mandateService.getMandateStats(currentDate.startOf('month').toDate(), currentDate.endOf('month').toDate()),
    mandateService.getActiveMandateStats(currentDate.startOf('month').toDate(), currentDate.endOf('month').toDate()),
    transactionService.getTransactionStats(currentDate.startOf('month').toDate(), currentDate.endOf('month').toDate()),
    userService.getUserStats(currentDate.startOf('month').toDate(), currentDate.endOf('month').toDate())
  ]);

  // Get last month stats for comparison
  const lastMonthStats = await Promise.all([
    mandateService.getMandateStats(lastMonth.startOf('month').toDate(), lastMonth.endOf('month').toDate()),
    mandateService.getActiveMandateStats(lastMonth.startOf('month').toDate(), lastMonth.endOf('month').toDate()),
    transactionService.getTransactionStats(lastMonth.startOf('month').toDate(), lastMonth.endOf('month').toDate()),
    userService.getUserStats(lastMonth.startOf('month').toDate(), lastMonth.endOf('month').toDate())
  ]);

  // Calculate percentage changes
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const stats = {
    totalMandates: {
      count: currentMonthStats[0].total,
      percentageChange: calculatePercentageChange(currentMonthStats[0].total, lastMonthStats[0].total)
    },
    activeMandates: {
      count: currentMonthStats[1].total,
      percentageChange: calculatePercentageChange(currentMonthStats[1].total, lastMonthStats[1].total)
    },
    totalTransactions: {
      count: currentMonthStats[2].total,
      percentageChange: calculatePercentageChange(currentMonthStats[2].total, lastMonthStats[2].total)
    },
    totalUsers: {
      count: currentMonthStats[3].total,
      percentageChange: calculatePercentageChange(currentMonthStats[3].total, lastMonthStats[3].total)
    }
  };

  return success(res, {
    message: 'Dashboard statistics retrieved successfully',
    data: stats
  });
});

/**
 * Get recent activities
 */
const getRecentActivities = catchAsync(async (req, res) => {
  const { limit = 5 } = req.query;

  // Get recent mandates and transactions
  const [recentMandates, recentTransactions] = await Promise.all([
    mandateService.getRecentMandates(Number(limit)),
    transactionService.getRecentTransactions(Number(limit))
  ]);

  return success(res, {
    message: 'Recent activities retrieved successfully',
    data: {
      recentMandates,
      recentTransactions
    }
  });
});

module.exports = {
  getDashboardStats,
  getRecentActivities
}; 