import { NextRequest, NextResponse } from 'next/server';
import { createValidatedBot } from '@/lib/test-environment';

/**
 * Smart webhook setup that auto-detects the correct URL from the request
 * This eliminates the need for environment variables
 */
export async function GET(request: NextRequest) {
    try {
        // Only run in production
        if (process.env.NODE_ENV !== 'production') {
            return NextResponse.json({ 
                success: false, 
                message: 'Auto-setup only runs in production',
                environment: process.env.NODE_ENV 
            });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json({ 
                success: false, 
                error: 'TELEGRAM_BOT_TOKEN not set' 
            }, { status: 500 });
        }

        console.log('🚀 Smart auto-setup initiated...');
        
        const bot = createValidatedBot();
        
        // Get current webhook info
        const webhookInfo = await bot.api.getWebhookInfo();
        
        // Auto-detect webhook URL from the current request
        const url = new URL(request.url);
        const webhookUrl = `${url.protocol}//${url.host}/api/webhook`;
        
        console.log('🔍 Auto-detected webhook URL:', webhookUrl);
        
        // Check if webhook is already correctly configured
        if (webhookInfo.url === webhookUrl) {
            console.log('✅ Webhook already configured correctly');
            return NextResponse.json({ 
                success: true, 
                message: 'Webhook already configured correctly',
                webhookUrl,
                timestamp: new Date().toISOString()
            });
        }

        // Set up webhook with auto-detected URL
        console.log('🔧 Configuring webhook with auto-detected URL...');
        
        const result = await bot.api.setWebhook(webhookUrl, {
            allowed_updates: ['pre_checkout_query', 'message'],
            drop_pending_updates: true
        });

        if (result) {
            console.log('✅ Webhook configured successfully with auto-detected URL!');
            return NextResponse.json({ 
                success: true, 
                message: 'Webhook configured successfully',
                webhookUrl,
                previousUrl: webhookInfo.url,
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('❌ Failed to set webhook');
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to set webhook' 
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Smart auto-setup error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; 