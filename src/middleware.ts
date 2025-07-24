import { NextRequest, NextResponse } from 'next/server';

// Track if webhook setup has been attempted in this deployment
let webhookSetupAttempted = false;

export async function middleware(request: NextRequest) {
    // Only run webhook setup once per deployment and only in production
    if (!webhookSetupAttempted &&
        process.env.NODE_ENV === 'production' &&
        process.env.TELEGRAM_BOT_TOKEN) {

        webhookSetupAttempted = true;

        // Run webhook setup asynchronously without blocking the request
        setTimeout(async () => {
            try {
                console.log('🚀 Middleware: Auto-configuring webhook with smart detection...');

                // Call the smart auto-setup endpoint
                const url = new URL(request.url);
                const smartSetupUrl = `${url.protocol}//${url.host}/api/auto-setup-smart`;

                const response = await fetch(smartSetupUrl);
                const result = await response.json();

                if (result.success) {
                    console.log('✅ Middleware: Smart webhook auto-configuration completed');
                } else {
                    console.warn('⚠️ Middleware: Smart webhook setup failed:', result.error);
                }
            } catch (error) {
                console.error('❌ Middleware: Smart webhook setup error:', error);
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