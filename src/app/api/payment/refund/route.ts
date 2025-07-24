import { NextRequest, NextResponse } from 'next/server';
import { Bot } from 'grammy';

// In-memory store (use database in production)
declare global {
  var paymentStore: Map<string, any>;
}

if (!global.paymentStore) {
  global.paymentStore = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    const { paymentId } = await request.json();
    
    const payment = global.paymentStore.get(paymentId);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'paid') {
      return NextResponse.json(
        { error: 'Only paid payments can be refunded' },
        { status: 400 }
      );
    }

    // Note: Telegram Stars refunds require the telegram_payment_charge_id
    // which is received in the successful_payment webhook
    if (!payment.telegramPaymentChargeId) {
      return NextResponse.json(
        { error: 'Payment charge ID not found. Cannot process refund.' },
        { status: 400 }
      );
    }

    const bot = new Bot(botToken);

    try {
      // Refund the payment using Telegram Bot API
      await bot.api.refundStarPayment(
        payment.userId,
        payment.telegramPaymentChargeId
      );

      // Update payment status
      payment.status = 'refunded';
      payment.refundedAt = new Date().toISOString();
      global.paymentStore.set(paymentId, payment);

      return NextResponse.json({
        success: true,
        message: 'Refund processed successfully'
      });

    } catch (telegramError) {
      console.error('Telegram refund error:', telegramError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process refund with Telegram',
          message: 'Refund request failed. Please try again later.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Refund processing failed',
        message: 'An error occurred while processing the refund.'
      },
      { status: 500 }
    );
  }
}