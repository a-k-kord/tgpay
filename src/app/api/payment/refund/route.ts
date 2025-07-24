import { NextRequest, NextResponse } from 'next/server';
import { PaymentData } from '@/features/payment/types';

// In-memory store (use database in production)
declare global {
  var paymentStore: Map<string, PaymentData>;
}

if (!global.paymentStore) {
  global.paymentStore = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const payment = global.paymentStore.get(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment cannot be refunded' },
        { status: 400 }
      );
    }

    // Process refund
    payment.status = 'refunded';
    global.paymentStore.set(paymentId, payment);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}