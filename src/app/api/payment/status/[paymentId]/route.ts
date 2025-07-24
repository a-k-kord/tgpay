import { NextRequest, NextResponse } from 'next/server';

// In-memory store (use database in production)
declare global {
  var paymentStore: Map<string, any>;
}

if (!global.paymentStore) {
  global.paymentStore = new Map();
}

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params;
    
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