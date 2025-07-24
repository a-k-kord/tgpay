import { NextResponse } from 'next/server';
import { ensureWebhookIsConfigured } from '@/lib/webhook-setup';

/**
 * This endpoint automatically configures the webhook when called
 * It's designed to be called once during deployment or first app load
 */
export async function GET() {
    try {
        console.log('🚀 Auto-setup initiated...');
        await ensureWebhookIsConfigured();
        
        return NextResponse.json({ 
            success: true, 
            message: 'Webhook auto-configuration completed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Auto-setup error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; 