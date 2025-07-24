import { NextRequest, NextResponse } from 'next/server';
import { PaymentData } from '@/features/payment/types';

// In-memory store (use database in production)
declare global {
  var paymentStore: Map<string, PaymentData>;
}

if (!global.paymentStore) {
  global.paymentStore = new Map();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    const payment = global.paymentStore.get(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}

// Disable static generation for this route
export const dynamic = 'force-dynamic';

// Configure runtime
export const runtime = 'edge';