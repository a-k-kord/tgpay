import { NextResponse } from 'next/server';
import { createValidatedBot } from '@/lib/test-environment';

export async function GET() {
    try {
        const bot = createValidatedBot();

        // Get webhook info
        const webhookInfo = await bot.api.getWebhookInfo();

        // Expected webhook URL
        const expectedWebhookUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}/api/webhook`
            : 'https://tgpay.vercel.app/api/webhook';

        return NextResponse.json({
            webhookInfo,
            expectedWebhookUrl,
            environment: process.env.NODE_ENV,
            vercelUrl: process.env.VERCEL_URL,
            isWebhookSet: !!webhookInfo.url,
            webhookUrlMatches: webhookInfo.url === expectedWebhookUrl,
            pendingUpdateCount: webhookInfo.pending_update_count,
            lastErrorDate: webhookInfo.last_error_date,
            lastErrorMessage: webhookInfo.last_error_message,
            maxConnections: webhookInfo.max_connections
        });
    } catch (error) {
        console.error('Failed to get webhook info:', error);
        return NextResponse.json({
            error: 'Failed to get webhook info',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'; 