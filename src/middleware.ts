import { NextRequest, NextResponse } from 'next/server';

// Track if webhook setup has been attempted in this deployment
let webhookSetupAttempted = false;

export async function middleware(_request: NextRequest) {
    // Only run webhook setup once per deployment and only in production
    if (!webhookSetupAttempted &&
        process.env.NODE_ENV === 'production' &&
        process.env.TELEGRAM_BOT_TOKEN) {

        webhookSetupAttempted = true;

        // Run webhook setup asynchronously without blocking the request
        setTimeout(async () => {
            try {
                console.log('🚀 Middleware: Auto-configuring webhook...');

                // Import and run webhook setup
                const { ensureWebhookIsConfigured } = await import('./lib/webhook-setup');
                await ensureWebhookIsConfigured();

                console.log('✅ Middleware: Webhook auto-configuration completed');
            } catch (error) {
                console.error('❌ Middleware: Webhook setup error:', error);
            }
        }, 100); // Small delay to not block the request
    }

    return NextResponse.next();
}

export const config = {
    // Run middleware on all API routes and pages, but exclude static files
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
} 