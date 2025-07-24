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
        const { userId, productId, quantity = 1 } = await request.json();

        // Validate request
        if (!userId || !productId || !quantity) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Import products to get price
        const { products } = await import('@/data/products');
        const product = products.find(p => p.id === productId);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        if (!product.inStock) {
            return NextResponse.json(
                { error: 'Product is out of stock' },
                { status: 400 }
            );
        }

        // Calculate total amount
        const amount = product.price * quantity;

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

        // Create proper Telegram Stars invoice
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json(
                { error: 'TELEGRAM_BOT_TOKEN environment variable is not set' },
                { status: 500 }
            );
        }

        // Create invoice using Telegram Bot API
        const invoicePayload = {
            title: product.name,
            description: product.description,
            payload: JSON.stringify({ paymentId, userId, productId }),
            currency: 'XTR', // Telegram Stars currency
            prices: [{ label: product.name, amount: amount }]
        };

        try {
            const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoicePayload)
            });

            const telegramData = await telegramResponse.json();

            if (!telegramData.ok) {
                console.error('Telegram API error:', telegramData);
                return NextResponse.json(
                    { error: 'Failed to create invoice with Telegram' },
                    { status: 500 }
                );
            }

            const invoiceLink = telegramData.result;
            return NextResponse.json({ invoiceLink, paymentId });

        } catch (telegramError) {
            console.error('Telegram API request failed:', telegramError);
            return NextResponse.json(
                { error: 'Failed to communicate with Telegram API' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Create invoice error:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
}