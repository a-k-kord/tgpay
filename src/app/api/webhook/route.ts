import { NextRequest, NextResponse } from 'next/server';
import { webhookCallback } from 'grammy';
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
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 Pre-checkout query received`);
    console.log(`[${timestamp}] Pre-checkout query data:`, JSON.stringify(ctx.preCheckoutQuery, null, 2));

    try {
        // Parse the payload to get payment information
        const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload);
        const { paymentId, userId } = payload;

        console.log(`[${timestamp}] 📦 Parsed payload:`, { paymentId, userId });

        // Validate the payment
        const payment = global.paymentStore.get(paymentId);
        console.log(`[${timestamp}] 💾 Payment data from store:`, payment);

        if (!payment || payment.userId !== userId) {
            console.log(`[${timestamp}] ❌ Payment validation failed - payment:`, !!payment, 'userId match:', payment?.userId === userId);
            await ctx.answerPreCheckoutQuery(false, 'Payment validation failed');
            return;
        }

        // Answer the pre-checkout query (approve the payment)
        console.log(`[${timestamp}] ✅ Approving pre-checkout query for payment: ${paymentId}`);
        await ctx.answerPreCheckoutQuery(true);

        console.log(`[${timestamp}] ✅ Pre-checkout query approved successfully for payment: ${paymentId}`);
    } catch (error) {
        console.error(`[${timestamp}] ❌ Pre-checkout query error:`, error);
        try {
            await ctx.answerPreCheckoutQuery(false, 'Payment processing error');
            console.log(`[${timestamp}] ❌ Sent failure response to pre-checkout query`);
        } catch (responseError) {
            console.error(`[${timestamp}] ❌ Failed to send pre-checkout response:`, responseError);
        }
    }
});

// Handle successful payments
bot.on('message:successful_payment', async (ctx) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 💰 Successful payment message received`);
    console.log(`[${timestamp}] Full message data:`, JSON.stringify(ctx.message, null, 2));

    try {
        const successfulPayment = ctx.message.successful_payment;

        if (!successfulPayment) {
            console.log(`[${timestamp}] ❌ No successful_payment data in message`);
            return;
        }

        console.log(`[${timestamp}] 💳 Successful payment data:`, JSON.stringify(successfulPayment, null, 2));

        // Parse the payload to get payment information
        const payload = JSON.parse(successfulPayment.invoice_payload);
        const { paymentId } = payload;

        console.log(`[${timestamp}] 📦 Parsed payment payload:`, payload);

        // Update payment status in store
        const payment = global.paymentStore.get(paymentId);
        console.log(`[${timestamp}] 💾 Current payment data:`, payment);

        if (payment) {
            payment.status = 'paid';
            payment.paidAt = new Date().toISOString();
            payment.telegramPaymentChargeId = successfulPayment.telegram_payment_charge_id;
            payment.totalAmount = successfulPayment.total_amount;

            global.paymentStore.set(paymentId, payment);
            console.log(`[${timestamp}] ✅ Payment status updated to 'paid' for: ${paymentId}`);

            // Send confirmation message to user
            console.log(`[${timestamp}] 📤 Sending confirmation message to user`);
            await ctx.reply(
                `🎉 Payment successful! Thank you for your purchase.\n\n` +
                `Payment ID: ${paymentId.slice(-8)}\n` +
                `Amount: ${successfulPayment.total_amount} ⭐\n\n` +
                `Your digital product will be available in the app.`
            );
            console.log(`[${timestamp}] ✅ Confirmation message sent successfully`);
        } else {
            console.log(`[${timestamp}] ❌ Payment not found in store for ID: ${paymentId}`);
        }
    } catch (error) {
        console.error(`[${timestamp}] ❌ Successful payment handling error:`, error);
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
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🌐 Webhook POST request received`);
    console.log(`[${timestamp}] Request URL:`, request.url);
    console.log(`[${timestamp}] Request headers:`, Object.fromEntries(request.headers.entries()));

    try {
        const body = await request.text();
        console.log(`[${timestamp}] 📥 Webhook body:`, body);

        // Parse the body to see what type of update this is
        try {
            const parsedBody = JSON.parse(body);
            console.log(`[${timestamp}] 📋 Parsed webhook data:`, JSON.stringify(parsedBody, null, 2));

            if (parsedBody.pre_checkout_query) {
                console.log(`[${timestamp}] 🔍 This is a PRE_CHECKOUT_QUERY webhook`);
            } else if (parsedBody.message?.successful_payment) {
                console.log(`[${timestamp}] 💰 This is a SUCCESSFUL_PAYMENT webhook`);
            } else {
                console.log(`[${timestamp}] ❓ Unknown webhook type`);
            }
        } catch (parseError) {
            console.log(`[${timestamp}] ❌ Failed to parse webhook body:`, parseError);
        }

        const webhookRequest = new Request(request.url, {
            method: 'POST',
            headers: request.headers,
            body
        });

        console.log(`[${timestamp}] 🔄 Processing webhook with Grammy...`);
        const response = await handleWebhook(webhookRequest);
        console.log(`[${timestamp}] ✅ Webhook processed successfully`);
        console.log(`[${timestamp}] Response status:`, response.status);

        return response;
    } catch (error) {
        console.error(`[${timestamp}] ❌ Webhook error:`, error);
        console.error(`[${timestamp}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Disable static generation for this route
export const dynamic = 'force-dynamic';