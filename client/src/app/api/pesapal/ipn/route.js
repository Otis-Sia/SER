import { NextResponse } from 'next/server';
import { getAuthToken, getTransactionStatus } from '@/lib/pesapal';
import { getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const OrderTrackingId = url.searchParams.get('OrderTrackingId');
    const OrderMerchantReference = url.searchParams.get('OrderMerchantReference');
    const OrderNotificationType = url.searchParams.get('OrderNotificationType');

    if (!OrderTrackingId) {
      return NextResponse.json({ error: 'Missing OrderTrackingId' }, { status: 400 });
    }

    // 1. Get Authentication Token
    const token = await getAuthToken();

    // 2. Query PesaPal for the transaction status
    const transactionStatus = await getTransactionStatus(token, OrderTrackingId);

    // 3. Log to Firestore
    try {
      const db = getAdminDb();
      if (db) {
        await db.collection("donations").doc(OrderTrackingId).set({
          merchantReference: OrderMerchantReference,
          trackingId: OrderTrackingId,
          notificationType: OrderNotificationType,
          status: transactionStatus.payment_status_description || transactionStatus.status,
          amount: transactionStatus.amount,
          currency: transactionStatus.currency,
          paymentMethod: transactionStatus.payment_method,
          account: transactionStatus.payment_account,
          createdAt: transactionStatus.created_date || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rawResponse: transactionStatus
        }, { merge: true });
        console.log(`Donation ${OrderTrackingId} logged with status: ${transactionStatus.payment_status_description}`);
      }
    } catch (dbError) {
      console.error("Failed to log donation to Firestore:", dbError);
      // We don't fail the IPN response if DB logging fails, just log it.
    }

    // 4. Respond to PesaPal IPN
    // PesaPal expects a 200 OK with a specific JSON response to acknowledge receipt.
    return NextResponse.json({
      orderNotificationType: OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: 200
    });

  } catch (error) {
    console.error("PesaPal IPN Error:", error);
    // Even on error, it's often best to return 500 so PesaPal retries later
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
