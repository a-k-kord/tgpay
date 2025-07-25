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
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;
        const userIdNum = parseInt(userId, 10);

        if (isNaN(userIdNum)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Filter payments for this user
        const userPayments = Array.from(global.paymentStore.values())
            .filter(payment => payment.userId === userIdNum)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(userPayments);
    } catch (error) {
        console.error('Payment history error:', error);
        return NextResponse.json(
            { error: 'Failed to get payment history' },
            { status: 500 }
        );
    }
}