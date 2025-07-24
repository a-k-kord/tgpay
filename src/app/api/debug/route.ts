import { NextResponse } from 'next/server';
import { createValidatedBot } from '@/lib/test-environment';

export async function GET() {
    try {
        const bot = createValidatedBot();

        // Test basic bot functionality
        const me = await bot.api.getMe();

        // Test if we can create a simple invoice link (this will fail if payments aren't configured)
        let invoiceResult = null;
        let invoiceError = null;

        try {
            invoiceResult = await bot.api.createInvoiceLink(
                "Test Payment",
                "Test description",
                JSON.stringify({ test: true }),
                "", // provider_token (empty for Stars)
                "XTR",
                [{ label: "Test", amount: 1 }]
            );
        } catch (error) {
            invoiceError = error instanceof Error ? error.message : 'Unknown error';
        }

        return NextResponse.json({
            success: true,
            bot: {
                id: me.id,
                username: me.username,
                first_name: me.first_name,
                can_join_groups: me.can_join_groups,
                can_read_all_group_messages: me.can_read_all_group_messages,
                supports_inline_queries: me.supports_inline_queries
            },
            invoice_test: {
                success: !!invoiceResult,
                result: invoiceResult,
                error: invoiceError
            },
            environment: process.env.NODE_ENV,
            is_test_env: process.env.USE_TEST_ENV
        });

    } catch (error) {
        console.error('Debug endpoint error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 