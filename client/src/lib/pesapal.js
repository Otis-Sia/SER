import crypto from 'crypto';

const PESAPAL_ENV = process.env.PESAPAL_ENV || 'sandbox';
const BASE_URL = PESAPAL_ENV === 'live' 
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/pesapalv3';

const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

/**
 * Gets the Bearer token required for all PesaPal 3.0 API requests
 */
export async function getAuthToken() {
  const url = `${BASE_URL}/api/Auth/RequestToken`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to get PesaPal token: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.status !== '200') {
    throw new Error(`PesaPal Auth Error: ${data.message || JSON.stringify(data)}`);
  }

  return data.token;
}

/**
 * Registers the IPN URL and returns the IPN ID
 */
export async function registerIPN(token, ipnUrl) {
  const url = `${BASE_URL}/api/URLSetup/RegisterIPN`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: 'POST'
    }),
    cache: 'no-store'
  });

  const data = await response.json();
  
  if (data.status !== '200' && data.error) {
    throw new Error(`IPN Registration Error: ${data.error.message || JSON.stringify(data)}`);
  }

  return data.ipn_id;
}

/**
 * Submits an order request to generate a payment redirect URL
 */
export async function submitOrderRequest(token, orderDetails) {
  const url = `${BASE_URL}/api/Transactions/SubmitOrderRequest`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderDetails),
    cache: 'no-store'
  });

  const data = await response.json();

  if (data.status !== '200' && data.error) {
    throw new Error(`Order Submission Error: ${data.error.message || JSON.stringify(data)}`);
  }

  return data; // Returns { redirect_url, order_tracking_id, merchant_reference, ... }
}

/**
 * Gets the transaction status based on order_tracking_id
 */
export async function getTransactionStatus(token, orderTrackingId) {
  const url = `${BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  });

  const data = await response.json();

  if (data.status !== '200' && data.error) {
    throw new Error(`Transaction Status Error: ${data.error.message || JSON.stringify(data)}`);
  }

  return data;
}
