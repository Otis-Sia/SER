import { NextResponse } from 'next/server';
import { getAuthToken, registerIPN, submitOrderRequest } from '@/lib/pesapal';
import { randomUUID } from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, firstName, lastName, email, phone } = body;

    if (!amount || !firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Get Authentication Token
    const token = await getAuthToken();

    // 2. Register IPN (or retrieve existing)
    // Note: The IPN URL should be publicly accessible.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seresponse.org';
    const ipnUrl = `${baseUrl}/api/pesapal/ipn`;
    
    let ipnId;
    try {
      ipnId = await registerIPN(token, ipnUrl);
    } catch (ipnError) {
      console.warn("IPN Registration warning (might already exist, moving on):", ipnError.message);
      // Fallback: If you have a static IPN ID you can use it, but PesaPal usually returns the existing one if the URL matches.
      // We'll throw if it critically fails and we don't have an ID
      throw ipnError; 
    }

    // 3. Prepare Order Details
    const merchantReference = `DONATION-${randomUUID().substring(0, 8)}`;
    
    const orderDetails = {
      id: merchantReference,
      currency: "KES",
      amount: parseFloat(amount),
      description: "Donation to Scouts Emergency Response",
      callback_url: `${baseUrl}/donate/callback`, // Where the user is redirected after payment attempt
      notification_id: ipnId,
      billing_address: {
        email_address: email,
        phone_number: phone || "",
        country_code: "KE",
        first_name: firstName,
        middle_name: "",
        last_name: lastName,
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: "",
        zip_code: ""
      }
    };

    // 4. Submit Order Request
    const orderResponse = await submitOrderRequest(token, orderDetails);

    if (orderResponse && orderResponse.redirect_url) {
      return NextResponse.json({ redirect_url: orderResponse.redirect_url });
    } else {
      return NextResponse.json({ error: 'Failed to generate payment link' }, { status: 500 });
    }

  } catch (error) {
    console.error("PesaPal Checkout Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
