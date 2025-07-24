import { createValidatedBot } from './test-environment';

/**
 * Automatically configures webhook URL on production deployment
 * This runs once when the app starts and ensures webhook is properly set
 */
export async function ensureWebhookIsConfigured(): Promise<void> {
    // Only run in production environment
    if (process.env.NODE_ENV !== 'production') {
        console.log('🔄 Development mode: Using polling instead of webhook');
        return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        console.error('❌ TELEGRAM_BOT_TOKEN not set, cannot configure webhook');
        return;
    }

    try {
        const bot = createValidatedBot();

        // Get current webhook info
        const webhookInfo = await bot.api.getWebhookInfo();

        // Determine the correct webhook URL for this deployment
        const webhookUrl = getWebhookUrl();

        // Check if webhook is already correctly configured
        if (webhookInfo.url === webhookUrl) {
            console.log('✅ Webhook already configured correctly:', webhookUrl);
            return;
        }

        // Set up webhook automatically
        console.log('🔧 Auto-configuring webhook for production...');
        console.log('📍 Setting webhook URL:', webhookUrl);

        const result = await bot.api.setWebhook(webhookUrl, {
            allowed_updates: ['pre_checkout_query', 'message'],
            drop_pending_updates: true
        });

        if (result) {
            console.log('✅ Webhook configured successfully!');
            console.log('🎯 Bot will now receive payment updates automatically');
        } else {
            console.error('❌ Failed to set webhook');
        }

    } catch (error) {
        console.error('❌ Error setting up webhook:', error);
        // Don't throw - let the app continue running
        // The debug interface can be used as fallback if needed
    }
}

/**
 * Determines the correct webhook URL based on environment
 */
function getWebhookUrl(): string {
    // Try to get from Vercel environment variables first
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}/api/webhook`;
    }

    // Try to get from custom environment variable
    if (process.env.WEBHOOK_URL) {
        return process.env.WEBHOOK_URL;
    }

    // Default to the main domain (update this to your actual domain)
    return 'https://tgpay.vercel.app/api/webhook';
}

/**
 * Removes webhook configuration (useful for switching back to polling)
 */
export async function removeWebhook(): Promise<boolean> {
    try {
        const bot = createValidatedBot();
        const result = await bot.api.deleteWebhook();
        console.log('🗑️ Webhook removed successfully');
        return result;
    } catch (error) {
        console.error('❌ Error removing webhook:', error);
        return false;
    }
} 