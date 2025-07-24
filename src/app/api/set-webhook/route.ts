import { NextRequest, NextResponse } from 'next/server';
import { createValidatedBot } from '@/lib/test-environment';

export async function POST(request: NextRequest) {
    try {
        const bot = createValidatedBot();
        
        // Get the webhook URL from request or use default
        const { webhookUrl } = await request.json().catch(() => ({}));
        
        const finalWebhookUrl = webhookUrl || `${request.nextUrl.origin}/api/webhook`;
        
        console.log('Setting webhook URL to:', finalWebhookUrl);
        
        // Set the webhook
        const result = await bot.api.setWebhook(finalWebhookUrl, {
            allowed_updates: ['pre_checkout_query', 'message']
        });
        
        if (result) {
            console.log('Webhook set successfully');
            return NextResponse.json({ 
                success: true, 
                webhookUrl: finalWebhookUrl,
                message: 'Webhook configured successfully'
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to set webhook'
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('Set webhook error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const bot = createValidatedBot();
        
        console.log('Removing webhook...');
        
        // Remove the webhook
        const result = await bot.api.deleteWebhook();
        
        if (result) {
            console.log('Webhook removed successfully');
            return NextResponse.json({ 
                success: true,
                message: 'Webhook removed successfully'
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to remove webhook'
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('Remove webhook error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; 