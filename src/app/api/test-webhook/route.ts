import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🧪 Test webhook endpoint called`);
    
    try {
        const body = await request.json();
        const { type, paymentId, userId } = body;
        
        console.log(`[${timestamp}] Test webhook data:`, { type, paymentId, userId });
        
        if (type === 'pre_checkout_query') {
            // Simulate pre-checkout query
            const testWebhook = {
                update_id: Date.now(),
                pre_checkout_query: {
                    id: `test-${Date.now()}`,
                    from: {
                        id: parseInt(userId),
                        is_bot: false,
                        first_name: 'Test User'
                    },
                    currency: 'XTR',
                    total_amount: 1,
                    invoice_payload: JSON.stringify({ paymentId, userId })
                }
            };
            
            console.log(`[${timestamp}] Simulating pre-checkout query:`, testWebhook);
            
            // Forward to webhook endpoint
            const webhookResponse = await fetch(`${request.nextUrl.origin}/api/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testWebhook)
            });
            
            const webhookResult = await webhookResponse.text();
            console.log(`[${timestamp}] Webhook response:`, webhookResult);
            
            return NextResponse.json({ 
                success: true, 
                webhookStatus: webhookResponse.status,
                webhookResponse: webhookResult
            });
        }
        
        if (type === 'successful_payment') {
            // Simulate successful payment
            const testWebhook = {
                update_id: Date.now(),
                message: {
                    message_id: Date.now(),
                    from: {
                        id: parseInt(userId),
                        is_bot: false,
                        first_name: 'Test User'
                    },
                    chat: {
                        id: parseInt(userId),
                        type: 'private'
                    },
                    date: Math.floor(Date.now() / 1000),
                    successful_payment: {
                        currency: 'XTR',
                        total_amount: 1,
                        invoice_payload: JSON.stringify({ paymentId, userId }),
                        telegram_payment_charge_id: `test-charge-${Date.now()}`,
                        provider_payment_charge_id: `test-provider-${Date.now()}`
                    }
                }
            };
            
            console.log(`[${timestamp}] Simulating successful payment:`, testWebhook);
            
            // Forward to webhook endpoint
            const webhookResponse = await fetch(`${request.nextUrl.origin}/api/webhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testWebhook)
            });
            
            const webhookResult = await webhookResponse.text();
            console.log(`[${timestamp}] Webhook response:`, webhookResult);
            
            return NextResponse.json({ 
                success: true, 
                webhookStatus: webhookResponse.status,
                webhookResponse: webhookResult
            });
        }
        
        return NextResponse.json({ error: 'Invalid test type. Use "pre_checkout_query" or "successful_payment"' }, { status: 400 });
        
    } catch (error) {
        console.error(`[${timestamp}] Test webhook error:`, error);
        return NextResponse.json({ error: 'Test webhook failed' }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; 