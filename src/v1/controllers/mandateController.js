const logger = require('../../helpers/logger');
const { decAESString, parseQueryString, encAESString, jsonToQueryParams } = require('../../helpers/common-helper');
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
  try {
    logger.info('Received request to create mandate');

    const uuid = uuidv4();
    logger.info(`Generated UUID: ${uuid}`);

    const { encResponse } = req.query;
    logger.debug(`Encrypted Response: ${encResponse}`);

    // Decrypt the response
    const inputData = await decAESString(encResponse);
    logger.debug(`Decrypted Data: ${inputData}`);

    // Convert the 'data' string into an object
    const parsedData = parseQueryString(inputData);
    logger.debug('Parsed Data:', parsedData);

    // Save or update merchant
    const merchantData = {
      name: parsedData.bankName,
      merchant_code: parsedData.clientcode,
      status: 'Active',
    };
    const merchant = await saveOrUpdateMerchant(merchantData);
    const slab = await getMerchantSlab(merchant.merchant_id, parseFloat(parsedData.amount));

    // Save or update user
    const userData = {
      name: `${parsedData.payerFName} ${parsedData.payerLName || ''}`,
      email: parsedData.emailId,
      mobile: parsedData.mobileNum,
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
        transaction_id: parsedData.clientTxnId, // Unique transaction ID
        user_id: user.user_id || null, // User ID (nullable)
        merchant_id: merchant.merchant_id || null, // Merchant ID (nullable)
        amount: parseFloat(parsedData.amount), // Transaction amount (Decimal)
        monthly_emi: slab.emi_amount || null, // Monthly EMI (nullable Decimal)
        start_date, // Start date (calculated)
        end_date, // End date (calculated)
        purpose: slab.mandate_category || 'NA', // Mandate category or default 'NA'
        max_amount: slab.emi_amount || null, // Maximum transaction amount set as EMI amount
        sabpaisa_txn_id: parsedData.SPTxnId, // Updated to snake_case

      };
    })();
    const transaction = await saveOrUpdateTransaction(transactionData);

    // Prepare mandate data
    const { start_date, end_date } = transactionData;

    const mandateData = {
      consumer_id: process.env.ENVIRONMENT == 'dev' ? uuidv4() : user.user_id, // Use `user_id` as the consumer ID
      customer_name: userData.name, // Full name from user data
      customer_mobile: userData.mobile, // Mobile number from user data
      customer_email_id: userData.email, // Email ID from user data
      start_date: moment(start_date).format('YYYY-MM-DD'), // Format start_date
      end_date: moment(end_date).format('YYYY-MM-DD'), // For/ End date (calculated from transaction data)
      max_amount: slab.emi_amount, // Max amount set as EMI amount from the slab
      frequency: slab.frequency, // Frequency from slab
      purpose: 'NA', // As discussed with Rahmat
      mandate_category: slab.mandate_category, // Mandate category from slab
      client_code: parsedData.clientcode, // Client code from parsed data
    };
    logger.info('Mandate data prepared:', mandateData);

    // Call the service to create the mandate
    const result = await createMandate(mandateData);
    logger.info('Mandate created successfully', result);

    res.redirect(result.bank_details_url);
  } catch (error) {
    const structuredError = handleError(error);
    logger.error('Error while creating mandate', structuredError);

    res.status(500).json({
      error: structuredError.message,
      details: structuredError.details,
      type: structuredError.type,
      meta: structuredError.meta,
    });
  }
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
        const user = await prisma.user.findUnique({
          where: { user_id: result.consumer_id },
        });

        if (!user) {
          throw new Error(`User not found for user_id (consumer_id): ${result.consumer_id}`);
        }

        const latestTransaction = await prisma.transaction.findFirst({
          where: { user_id: user.user_id },
          orderBy: { created_at: 'desc' },
        });

        if (!latestTransaction) {
          throw new Error(`No transactions found for user_id: ${user.user_id}`);
        }

        const { transaction_id, sabpaisa_txn_id } = latestTransaction;

        // Update transaction
        await updateTransaction({
          transaction_id,
          sabpaisa_txn_id,
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

    // Fetch the latest transaction and user for cumulative data
    const transaction = await getLatestTransactionByUserId(result.consumer_id);
    const user = await prisma.user.findUnique({
      where: { user_id: result.consumer_id },
    });

    if (!transaction || !user) {
      throw new Error('Unable to fetch transaction or user details.');
    }
    const merchant = await prisma.merchant.findFirst({
      where: { merchant_id: transaction.merchant_id },
      select: { merchant_code: true }, // Assuming `merchant_code` corresponds to `clientCode`
    });

    if (!merchant) {
      throw new Error(`Merchant not found for merchant_id: ${transaction.merchant_id}`);
    }

    const cumulativeData = {
      sabpaisaTxnId: transaction.sabpaisa_txn_id || null,
      clientTxnId: transaction.transaction_id || null,
      clientCode: merchant.merchant_code || null, // Add clientCode from merchant table
      mandateStatus: result.registration_status || null,
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
    res.render('mandateDetails', { mandate: result, redirectUrl: process.env.RETURNURL + '?enachResponse=' + encData });
  } catch (error) {
    const structuredError = handleError(error);
    logger.error('Error while processing webhook', structuredError);

    res.status(500).json({
      error: structuredError.message,
      details: structuredError.details,
      type: structuredError.type,
      meta: structuredError.meta,
    });
  }
};

module.exports = {
  handleCreateMandate,
  webHook
};
