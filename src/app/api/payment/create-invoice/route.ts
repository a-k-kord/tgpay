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
        const { userId, productId, amount } = await request.json();

        // Validate request
        if (!userId || !productId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate unique payment ID
        const paymentId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        // Store payment info
        const payment: PaymentData = {
            userId,
            productId,
            amount,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        global.paymentStore.set(paymentId, payment);

        // Create invoice link
        const botName = process.env.TELEGRAM_BOT_NAME;
        if (!botName) {
            return NextResponse.json(
                { error: 'TELEGRAM_BOT_NAME environment variable is not set' },
                { status: 500 }
            );
        }
        const invoiceLink = `https://t.me/${botName}?start=pay_${paymentId}`;

        return NextResponse.json({ invoiceLink, paymentId });
    } catch (error) {
        console.error('Create invoice error:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}