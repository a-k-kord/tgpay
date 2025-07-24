import { NextRequest, NextResponse } from 'next/server';
import { Bot } from 'grammy';
import { getProductById } from '../../../../data/products';
import { PaymentRequest } from '../../../../features/payment/types';

// Store payment data in memory (use a database in production)
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

    const bot = new Bot(botToken);
    const body: PaymentRequest = await request.json();
    const { productId, userId, quantity } = body;

    // Validate the product
    const product = getProductById(productId);
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
    const totalAmount = product.price * quantity;
    
    // Create a unique payment ID
    const paymentId = `pay_${Date.now()}_${userId}_${productId}`;
    
    // Create payload for tracking
    const payload = JSON.stringify({
      paymentId,
      productId,
      userId,
      quantity,
      timestamp: Date.now()
    });

    // Create invoice using Telegram Bot API
    const invoiceLink = await bot.api.createInvoiceLink(
      product.name, // title
      product.description, // description
      payload, // payload for tracking
      '', // provider_token (empty for Stars)
      'XTR', // currency (Telegram Stars)
      [
        {
          label: `${product.name} × ${quantity}`,
          amount: totalAmount
        }
      ]
    );

    // Store payment information
    global.paymentStore.set(paymentId, {
      paymentId,
      productId,
      userId,
      quantity,
      amount: totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      invoiceLink
    });

    return NextResponse.json({
      invoiceLink,
      paymentId
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}