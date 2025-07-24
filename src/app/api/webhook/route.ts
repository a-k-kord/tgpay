import { NextRequest, NextResponse } from 'next/server';
import { Bot, webhookCallback } from 'grammy';
import { PaymentData } from '@/features/payment/types';
import { createValidatedBot } from '@/lib/test-environment';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

// Use the environment-aware bot creation
const bot = createValidatedBot();

// In-memory store (use database in production)
declare global {
    var paymentStore: Map<string, PaymentData>;
}

if (!global.paymentStore) {
    global.paymentStore = new Map();
}

// Handle pre-checkout queries
bot.on('pre_checkout_query', async (ctx) => {
    try {
        // Parse the payload to get payment information
        const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload);
        const { paymentId, userId } = payload;

        // Validate the payment
        const payment = global.paymentStore.get(paymentId);

        if (!payment || payment.userId !== userId) {
            await ctx.answerPreCheckoutQuery(false, 'Payment validation failed');
            return;
        }

        // Answer the pre-checkout query (approve the payment)
        await ctx.answerPreCheckoutQuery(true);

        console.log('Pre-checkout query approved for payment:', paymentId);
    } catch (error) {
        console.error('Pre-checkout query error:', error);
        await ctx.answerPreCheckoutQuery(false, 'Payment processing error');
    }
});

// Handle successful payments
bot.on('message:successful_payment', async (ctx) => {
    try {
        const successfulPayment = ctx.message.successful_payment;

        if (!successfulPayment) {
            return;
        }

        // Parse the payload to get payment information
        const payload = JSON.parse(successfulPayment.invoice_payload);
        const { paymentId } = payload;

        // Update payment status in store
        const payment = global.paymentStore.get(paymentId);

        if (payment) {
            payment.status = 'paid';
            payment.paidAt = new Date().toISOString();
            payment.telegramPaymentChargeId = successfulPayment.telegram_payment_charge_id;
            payment.totalAmount = successfulPayment.total_amount;

            global.paymentStore.set(paymentId, payment);

            console.log('Payment successful:', paymentId);

            // Send confirmation message to user
            await ctx.reply(
                `🎉 Payment successful! Thank you for your purchase.\n\n` +
                `Payment ID: ${paymentId.slice(-8)}\n` +
                `Amount: ${successfulPayment.total_amount} ⭐\n\n` +
                `Your digital product will be available in the app.`
            );
        }
    } catch (error) {
        console.error('Successful payment handling error:', error);
    }
});

// Handle start command
bot.command('start', (ctx) => {
    ctx.reply(
        'Welcome to our Digital Shop! 🛒\n\n' +
        'Browse and purchase digital products using Telegram Stars. ' +
        'Open our mini app to start shopping!'
    );
});

// Create webhook handler
const handleWebhook = webhookCallback(bot, 'std/http');

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const webhookRequest = new Request(request.url, {
            method: 'POST',
            headers: request.headers,
            body
        });

        return await handleWebhook(webhookRequest);
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Disable static generation for this route
export const dynamic = 'force-dynamic';