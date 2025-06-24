const axios = require('axios');
const logger = require('../helpers/logger'); // Custom logger utility for debugging
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createMandate = async (mandateData) => {
  try {
    const endpointUrl = process.env.SABPAISA_SUB_BASEURL + 'mandate/create-mandate/'
    // Prepare request payload
    const payload = {
      consumer_id: mandateData.consumer_id,
      customer_name: mandateData.customer_name,
      customer_mobile: mandateData.customer_mobile,
      customer_email_id: mandateData.customer_email_id,
      start_date: mandateData.start_date,
      end_date: mandateData.end_date,
      max_amount: mandateData.max_amount.toFixed(2).toString(),
      frequency: mandateData.frequency,
      purpose: mandateData.purpose,
      mandate_category: mandateData.mandate_category,
      client_code: mandateData.client_code,
      redirect_url: process.env.BASEURL + 'v1/mandate/web-hook/',
      customer_type: 'pg',
      amount_type: "Fixed",
      until_cancel:0,
      emi_amount: mandateData.max_amount.toFixed(2).toString() //as discussed with Bhargava

    };

    // Set headers
    const headers = {
      'api-key': process.env.SABPAISA_SUB_TOKEN, // Pass API key from mandateData
      'Content-Type': 'application/json',
    };

    // Log the request details for debugging
    logger.info('Sending Create Mandate Request', {
      url: endpointUrl,
      headers,
      body: payload,
    });

    // Make the POST request
    const response = await axios.post(endpointUrl, payload, { headers });

    // Log the response
    logger.info('Create Mandate Response', {
      status: response.status,
      data: response.data,
    });

    // Return the API response
    return response.data;
  } catch (error) {
    // Log the error
    logger.error('Error in Create Mandate Service', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    // Re-throw the error for handling by the calling function
    throw error;
  }
};

const mandateEnquiry = async (consumer_id) => {
  try {
    const endpointUrl = process.env.SABPAISA_SUB_BASEURL + 'mandate/mandate-enquiry/'

    // Prepare request payload
    const payload = {
      consumer_id,
    };

    // Set headers
    const headers = {
      'api-key': process.env.SABPAISA_SUB_TOKEN,
      'Content-Type': 'application/json',
    };

    // Log the request details for debugging
    logger.info('Sending Mandate Enquiry Request', {
      url: endpointUrl,
      headers,
      body: payload,
    });

    // Make the POST request
    const response = await axios.post(endpointUrl, payload, { headers });

    // Log the response
    logger.info('Mandate Enquiry Response', {
      status: response.status,
      data: response.data,
    });

    // Return the API response
    return response.data;
  } catch (error) {
    // Log the error
    logger.error('Error in Mandate Enquiry Service', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    // Re-throw the error for handling by the calling function
    throw error;
  }
};
// Fetch the appropriate merchant slab based on the amount
const getMerchantSlab = async (merchant_id, amount) => {
  try {
    const slab = await prisma.merchant_slab.findFirst({
      where: {
        merchant_id,
        slab_from: { lte: amount },
        slab_to: { gte: amount },
        effective_date: { lte: new Date() },
        expiry_date: { gte: new Date() },
        status: 1,
      },
    });

    if (!slab) {
      throw new Error(`No slab found for merchant ${merchant_id} and amount ${amount}`);
    }

    logger.info('Merchant slab found:', slab);
    return slab;
  } catch (error) {
    logger.error('Error in getMerchantSlab:', error);
    throw error;
  }
};



module.exports = {
  createMandate,
  mandateEnquiry,
  getMerchantSlab
};
