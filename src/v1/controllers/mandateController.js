const logger = require('../../helpers/logger');
const { decAESString, parseQueryString, encAESString, jsonToQueryParams, getMandateStatus } = require('../../helpers/common-helper');
const { createMandate, mandateEnquiry, getMerchantSlab } = require('../../services/mandateService');
const { v4: uuidv4 } = require('uuid');
const { saveOrUpdateUser } = require('../../services/userService');
const { saveOrUpdateMerchant } = require('../../services/merchantService');
const { updateTransaction, saveOrUpdateTransaction, getLatestTransactionByUserId } = require('../../services/transactionService');
const handleError = require('../../helpers/error-helper');
const { calculateDates } = require('../../helpers/date-helper');
const moment = require('moment');
const { createOrUpdateUserMandate } = require('./usermandateController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to generate EMI schedule based on frequency
const generateEmiSchedule = (startDate, endDate, frequency, emiAmount) => {
  const schedule = [];
  const start = moment(startDate);
  const end = moment(endDate);
  let current = start.clone();
  let installmentNumber = 1;

  while (current.isSameOrBefore(end)) {
    schedule.push({
      installment: installmentNumber,
      dueDate: current.format('YYYY-MM-DD'),
      emiAmount: emiAmount
    });

    // Increment based on frequency
    switch (frequency) {
      case 'DAIL': // Daily
        current.add(1, 'day');
        break;
      case 'WEEK': // Weekly
        current.add(1, 'week');
        break;
      case 'MNTH': // Monthly
        current.add(1, 'month');
        break;
      case 'BIMN': // Bi-monthly
        current.add(2, 'months');
        break;
      case 'QURT': // Quarterly
        current.add(3, 'months');
        break;
      case 'MIAN': // Semi-annually
        current.add(6, 'months');
        break;
      case 'YEAR': // Yearly
        current.add(1, 'year');
        break;
      default: // Default to monthly
        current.add(1, 'month');
    }

    installmentNumber++;
  }

  return schedule;
};

// Helper function to format mandate data for display
const formatMandateData = (mandateData) => {
  const formatted = {};

  for (const [key, value] of Object.entries(mandateData)) {
    if (!value || value === 'null' || value === 'undefined') {
      formatted[key] = 'N/A';
      continue;
    }

    // Format dates
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('created')) {
      try {
        const date = new Date(value);
        if (!isNaN(date)) {
          formatted[key] = date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        } else {
          formatted[key] = value;
        }
      } catch (e) {
        formatted[key] = value;
      }
    }
    // Format amounts
    else if (key.toLowerCase().includes('amount')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        formatted[key] = `₹${num.toLocaleString('en-IN')}`;
      } else {
        formatted[key] = value;
      }
    }
    // Format status fields with color classes
    else if (key.toLowerCase().includes('status')) {
      const status = value.toString().toLowerCase();
      let statusClass = '';
      if (status.includes('active') || status.includes('success')) {
        statusClass = 'status-active';
      } else if (status.includes('pending') || status.includes('processing')) {
        statusClass = 'status-pending';
      } else if (status.includes('failed') || status.includes('error')) {
        statusClass = 'status-failed';
      }
      formatted[key] = { value, class: statusClass };
    }
    else {
      formatted[key] = value;
    }
  }

  return formatted;
};

const handleCreateMandate = async (req, res) => {
  let transaction = null;
  try {
    logger.info('Received request to create mandate');

    const uuid = uuidv4();
    logger.info(`Generated UUID: ${uuid}`);

    const { encResponse } = req.query;
    logger.debug(`Encrypted Response: ${decodeURIComponent(encResponse)}`);

    // Decrypt the response
    const inputData = await decAESString(decodeURIComponent(encResponse));
    logger.debug(`Decrypted Data: ${inputData}`);

    // Convert the 'data' string into an object
    const parsedData = parseQueryString(inputData);
    logger.debug('Parsed Data:', parsedData);

    // Save or update merchant and user, calculate dates, etc.
    console.log(parsedData, 'parsedData')
    const merchantData = {
      merchant_code: parsedData.clientCode,
      status: 1,
    };
    const merchant = await saveOrUpdateMerchant(merchantData);
    const slab = await getMerchantSlab(merchant.merchant_id, parseFloat(parsedData.amount));

    // Calculate EMI and tenure similar to calculateMandateDetails
    const paymentAmount = parseFloat(parsedData.amount);
    const slabFrom = parseFloat(slab.slab_from);
    const slabTo = parseFloat(slab.slab_to);
    const baseAmount = parseFloat(slab.base_amount);
    const emiTenure = parseInt(slab.emi_tenure);
    const processingFeePercentage = parseFloat(slab.processing_fee) || 0;
    const frequency = slab.frequency;

    // Calculate EMI details using the same formula as calculateMandateDetails
    const totalAmount = paymentAmount;
    const numberOfPayments = emiTenure;
    const emiAmount = (totalAmount - baseAmount) / numberOfPayments;
    const totalEmiAmount = emiAmount * numberOfPayments;
    const processingFee = (processingFeePercentage / 100) * totalAmount;
    const totalPayable = baseAmount + totalEmiAmount + processingFee;

    // Calculate mandate dates based on frequency and EMI tenure
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 3); // Add 3 days as per requirement

    let durationInMonths = emiTenure;

    // Adjust duration based on frequency
    switch (frequency) {
      case 'DAIL': // Daily - convert to months (approximate)
        durationInMonths = Math.ceil(emiTenure / 30);
        break;
      case 'WEEK': // Weekly - convert to months (approximate)
        durationInMonths = Math.ceil(emiTenure / 4);
        break;
      case 'MNTH': // Monthly - duration is same as EMI tenure
        durationInMonths = emiTenure;
        break;
      case 'BIMN': // Bi-monthly - convert to months
        durationInMonths = emiTenure * 2;
        break;
      case 'QURT': // Quarterly - convert to months
        durationInMonths = emiTenure * 3;
        break;
      case 'MIAN': // Semi-annually - convert to months
        durationInMonths = emiTenure * 6;
        break;
      case 'YEAR': // Yearly - convert to months
        durationInMonths = emiTenure * 12;
        break;
      default: // Default to monthly
        durationInMonths = emiTenure;
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationInMonths);

    console.log('EMI Calculation Details:', {
      paymentAmount,
      baseAmount,
      emiTenure,
      emiAmount,
      totalEmiAmount,
      processingFee,
      totalPayable,
      durationInMonths,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    const userData = {
      name: parsedData.payerName ? `${parsedData.payerName} ${parsedData.payerLName || ''}` : parsedData.payerName,
      email: parsedData.payerEmail,
      mobile: parsedData.payerMobile.slice(-10),
    };
    const user = await saveOrUpdateUser(userData);

    const transactionData = (() => {
      return {
        transaction_id: uuidv4(),
        client_transaction_id: parsedData.clientTxnId,
        user_id: user.user_id || null,
        merchant_id: merchant.merchant_id || null,
        sabpaisa_txn_id: parsedData.sabpaisaTxnId,
        amount: paymentAmount,
        monthly_emi: emiAmount,
        start_date: startDate,
        end_date: endDate,
        purpose: slab.mandate_category || 'NA',
        max_amount: emiAmount,
        // Add additional EMI calculation fields
        downpayment: baseAmount,
        total_emi_amount: totalEmiAmount,
        processing_fee: processingFee,
        total_payable: totalPayable,
        emi_tenure: emiTenure,
        frequency: frequency,
        duration: durationInMonths
      };
    })();

    transaction = await saveOrUpdateTransaction(transactionData);

    // Prepare mandate data
    const { start_date, end_date } = transactionData;
    const mandateData = {
      consumer_id: process.env.ENVIRONMENT === 'dev' ? uuidv4() : parsedData.sabpaisaTxnId,
      customer_name: userData.name,
      customer_mobile: userData.mobile,
      customer_email_id: userData.email,
      start_date: moment(start_date).format('YYYY-MM-DD'),
      end_date: moment(end_date).format('YYYY-MM-DD'),
      max_amount: emiAmount,
      frequency: frequency,
      purpose: 'NA',
      mandate_category: slab.mandate_category,
      client_code: parsedData.clientCode
    };
    logger.info('Mandate data prepared:', mandateData);

    // Call the service to create the mandate
    const result = await createMandate(mandateData);
    logger.info('Mandate created successfully', result);
    console.log(result, 'result')

    // Generate EMI schedule based on the calculated start and end dates and EMI amount
    const emiSchedule = generateEmiSchedule(transactionData.start_date, transactionData.end_date, frequency, emiAmount);
    console.log(emiSchedule, 'emiSchedule')

    // Render the mandate success view with mandate details and EMI schedule
    return res.render('mandateRedirect', {
      mandateDetails: {
        payerName: parsedData.payerName,
        payerEmail: parsedData.payerEmail,
        payerMobile: parsedData.payerMobile,
        clientTxnId: parsedData.clientTxnId,
        amount: paymentAmount,
        clientCode: parsedData.clientCode,
        status: parsedData.status,
        sabpaisaTxnId: parsedData.sabpaisaTxnId,
        bankMessage: parsedData.bankMessage,
        transDate: parsedData.transDate,
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        frequency: frequency,
        emiAmount: emiAmount,
        // Add additional EMI calculation details
        downpayment: baseAmount,
        totalEmiAmount: totalEmiAmount,
        processingFee: processingFee,
        totalPayable: totalPayable,
        emiTenure: emiTenure,
        duration: durationInMonths,
        numberOfPayments: numberOfPayments
      },
      emiSchedule,
      redirectUrl: result.bank_details_url,
      message: 'Mandate created successfully!'
    });
  } catch (error) {
    console.log(error, 'error')
    const structuredError = handleError(error);
    logger.error('Error while creating mandate', structuredError);
    return handleMandateFailure(transaction, structuredError, res);
  }
};


const handleMandateFailure = (transaction, error, res) => {
  logger.info('Handling mandate failure', {
    transactionId: transaction?.transaction_id,
    sabpaisaTxnId: transaction?.sabpaisa_txn_id,
    clientTxnId: transaction?.client_transaction_id,
    error: error.message
  });

  const failureData = {
    sabpaisaTxnId: transaction?.sabpaisa_txn_id || null,
    clientTxnId: transaction?.client_transaction_id || null,
    clientCode: null,
    mandateStatus: 'FAILED',
    mandateDate: new Date().toISOString(),
    errorMessage: error.message || 'Mandate registration failed',
    bankStatusMessage: 'Failed'
  };

  logger.debug('Generated failure response data:', failureData);

  const encryptedResponse = encAESString(jsonToQueryParams(failureData));
  logger.debug('Encrypted failure response:', encryptedResponse);

  // Render the mandateFailure template
  return res.render('mandateFailure', {
    mandateDetails: {
      ...failureData,
      status: 'FAILED'
    },
    redirectUrl: process.env.RETURNURL,
    enachResponse: encryptedResponse,
    message: failureData.errorMessage
  });
};

const webHook = async (req, res) => {
  try {
    logger.info('Received webhook request', { params: req.params });

    const { id } = req.params; // Assume 'id' is the mandate ID
    logger.debug(`Fetching mandate details for mandate ID: ${id}`);

    // Fetch mandate details
    const enquiryData = await mandateEnquiry(id);
    logger.info('Mandate details fetched successfully');
    const { result } = enquiryData;

    // Asynchronous database updates
    (async () => {
      try {
        // Find transaction using sabpaisa_txn_id (consumer_id)
        const transaction = await prisma.transaction.findFirst({
          where: { sabpaisa_txn_id: result.consumer_id },
          orderBy: { created_at: 'desc' },
        });

        if (!transaction) {
          throw new Error(`No transaction found for sabpaisa_txn_id: ${result.consumer_id}`);
        }

        const user = await prisma.user.findUnique({
          where: { user_id: transaction.user_id },
        });

        if (!user) {
          throw new Error(`User not found for user_id: ${transaction.user_id}`);
        }

        const { transaction_id } = transaction;

        // Update transaction
        await updateTransaction({
          transaction_id,
          sabpaisa_txn_id: result.consumer_id,
          user_id: user.user_id,
          start_date: result.start_date,
          end_date: result.end_date,
          max_amount: parseFloat(result.max_amount),
          purpose: result.purpose || 'NA',
        });

        // Create or update user mandate
        await createOrUpdateUserMandate({
          transaction_id,
          user_id: user.user_id,
          amount: parseFloat(result.max_amount),
          due_date: result.start_date,
          bank_account_number: result.account_number,
          bank_account_type: result.account_type,
          bank_name: result.account_holder_name,
          bank_ifsc: result.ifsc_code,
          frequency: result.frequency,
          registration_status: result.registration_status,
          bank_status_message: result.bank_status_message,
        });

        logger.info('Database updates completed successfully.');
      } catch (updateError) {
        logger.error('Error during database updates:', updateError);
      }
    })();

    // Fetch the latest transaction using sabpaisa_txn_id
    const transaction = await prisma.transaction.findFirst({
      where: { sabpaisa_txn_id: result.consumer_id },
      orderBy: { created_at: 'desc' },
    });

    if (!transaction) {
      return handleMandateFailure(null, new Error('No transaction found'), res);
    }

    const user = await prisma.user.findUnique({
      where: { user_id: transaction.user_id },
    });

    if (!user) {
      return handleMandateFailure(transaction, new Error('User not found'), res);
    }

    const merchant = await prisma.merchant.findFirst({
      where: { merchant_id: transaction.merchant_id },
      select: { merchant_code: true },
    });

    if (!merchant) {
      return handleMandateFailure(transaction, new Error('Merchant not found'), res);
    }

    const cumulativeData = {
      sabpaisaTxnId: transaction.sabpaisa_txn_id || null,
      clientTxnId: transaction.client_transaction_id || null,
      clientCode: merchant.merchant_code || null, // Add clientCode from merchant table
      mandateStatus: result.registration_status ? getMandateStatus(result.registration_status) : null,
      mandateDate: new Date().toISOString(), // Example: current timestamp
      frequency: result.frequency || null,
      registrationId: result.registration_id || null,
      customerName: result.customer_name || null,
      customerMobile: result.customer_mobile || null,
      customerEmailId: result.customer_email_id || null,
      bankCode: result.bank_code || null,
      accountNumber: result.account_number || null,
      accountType: result.account_type || null,
      accountHolderName: result.account_holder_name || null,
      aadharNumber: result.aadhar_number || null,
      ifscCode: result.ifsc_code || null,
      startDate: transaction.start_date || null, // Use transaction start_date
      endDate: transaction.end_date || null, // Use transaction end_date
      maxAmount: result.max_amount || null,
      amountType: result.amount_type || null,
      pan: result.pan || null,
      phoneNumber: result.phone_number || null,
      isActive: result.is_active || null,
      purpose: transaction.purpose || null, // Use transaction purpose
      mode: result.mode || null,
      createdOn: result.created_on || null, // Original field
      bankStatusMessage: result.bank_status_message || null,
      vpa: result.vpa || null,
      bankTransactionId: result.bank_transaction_id || null,
      bankMandateRegNo: result.bank_mandate_reg_no || null,
      bankReferenceNumber: result.bank_reference_number || null,
    };
    console.log(cumulativeData, 'cumulativeData')
    // Encrypt cumulative data
    const encData = encAESString(jsonToQueryParams(cumulativeData));
    logger.debug(`Encrypted mandate data: ${encData}`);
    // Log decrypted response for validation
    const decryptedData = decAESString(encData);
    logger.info(`Decrypted cumulative mandate data:${decryptedData}`);

    // Render the mandate details page
    // Remove specific fields
    delete result.consumer_id;
    delete result.created_on;
    delete result.redirect_url;

    // Format the mandate data for display
    const formattedMandate = formatMandateData(result);

    console.log(process.env.RETURNURL + '?enachResponse=' + encData)
    res.render('mandateDetails', {
      mandate: formattedMandate,
      redirectUrl: process.env.RETURNURL,
      enachResponse: decodeURIComponent(encData)
    });
  } catch (error) {
    const structuredError = handleError(error);
    logger.error('Error while processing webhook', structuredError);

    let transaction = null;
    try {
      if (req.params.id) {
        const enquiryData = await mandateEnquiry(req.params.id);
        transaction = await prisma.transaction.findFirst({
          where: { sabpaisa_txn_id: enquiryData.result.consumer_id },
          orderBy: { created_at: 'desc' },
        });
      }
    } catch (err) {
      logger.error('Error fetching transaction for failure response:', err);
    }

    return handleMandateFailure(transaction, structuredError, res);
  }
};

module.exports = {
  handleCreateMandate,
  webHook
};
