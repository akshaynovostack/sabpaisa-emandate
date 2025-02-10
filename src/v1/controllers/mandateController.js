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

    // Save or update merchant
    const merchantData = {
      merchant_code: parsedData.clientCode,
      status: 1,
    };
    const merchant = await saveOrUpdateMerchant(merchantData);
    const slab = await getMerchantSlab(merchant.merchant_id, parseFloat(parsedData.amount));

    // Save or update user
    const userData = {
      name: parsedData.payerName ? `${parsedData.payerName} ${parsedData.payerLName || ''}` : parsedData.payerName,
      email: parsedData.payerEmail,
      mobile: parsedData.payerMobile.slice(-10),
    };
    const user = await saveOrUpdateUser(userData);

    // Prepare transaction data
    const transactionData = (() => {
      const { start_date, end_date } = calculateDates(
        new Date(),
        slab.frequency,
        slab.duration,
        slab.expiry_date
      );

      return {
        transaction_id: uuidv4(), // Generate new UUID for transaction_id
        client_transaction_id: parsedData.clientTxnId, // Store client's transaction ID
        user_id: user.user_id || null,
        merchant_id: merchant.merchant_id || null,
        sabpaisa_txn_id: parsedData.sabpaisaTxnId,
        amount: parseFloat(parsedData.amount),
        monthly_emi: slab.emi_amount || null,
        start_date,
        end_date,
        purpose: slab.mandate_category || 'NA',
        max_amount: slab.emi_amount || null,
      };
    })();

    // After creating transaction, store it for potential error handling
    transaction = await saveOrUpdateTransaction(transactionData);

    // Prepare mandate data
    const { start_date, end_date } = transactionData;

    const mandateData = {
      consumer_id: process.env.ENVIRONMENT == 'dev' ? uuidv4() : parsedData.sabpaisaTxnId, // Use sabpaisa txn id as per laxmikant
      customer_name: userData.name, // Full name from user data
      customer_mobile: userData.mobile, // Mobile number from user data
      customer_email_id: userData.email, // Email ID from user data
      start_date: moment(start_date).format('YYYY-MM-DD'), // Format start_date
      end_date: moment(end_date).format('YYYY-MM-DD'), // For/ End date (calculated from transaction data)
      max_amount: slab.emi_amount, // Max amount set as EMI amount from the slab
      frequency: slab.frequency, // Frequency from slab
      purpose: 'NA', // As discussed with Rahmat
      mandate_category: slab.mandate_category, // Mandate category from slab
      client_code: parsedData.clientCode, // Client code from parsed data
    };

    logger.info('Mandate data prepared:', mandateData);

    // Call the service to create the mandate
    const result = await createMandate(mandateData);
    logger.info('Mandate created successfully', result);

    res.redirect(result.bank_details_url);
  } catch (error) {
    const structuredError = handleError(error);
    logger.error('Error while creating mandate', structuredError);
    return handleMandateFailure(transaction, structuredError, res);
  }
};

const handleMandateFailure = (transaction, error, res) => {
  const failureData = {
    sabpaisaTxnId: transaction?.sabpaisa_txn_id || null,
    clientTxnId: transaction?.client_transaction_id || null,
    clientCode: null,
    mandateStatus: 'FAILED',
    mandateDate: new Date().toISOString(),
    errorMessage: error.message || 'Mandate registration failed',
    bankStatusMessage: 'Failed'
  };

  const encryptedResponse = encAESString(jsonToQueryParams(failureData));
  return res.redirect(`${process.env.RETURNURL}?enachResponse=${encryptedResponse}`);
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
    console.log(process.env.RETURNURL + '?enachResponse=' + encData)
    res.render('mandateDetails', { mandate: result, redirectUrl: process.env.RETURNURL, enachResponse: decodeURIComponent(encData) });
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
