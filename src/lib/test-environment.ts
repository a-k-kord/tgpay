import { Bot } from 'grammy';

// Test Environment Configuration
export const isTestEnvironment = process.env.NODE_ENV === 'development' || process.env.USE_TEST_ENV === 'true';

/**
 * Get the appropriate Telegram API URL based on environment
 */
export const getTelegramApiUrl = (token: string) => {
  if (isTestEnvironment) {
    // Use test environment API
    return `https://api.telegram.org/bot${token}/test/`;
  }
  // Use production API
  return `https://api.telegram.org/bot${token}/`;
};

/**
 * Create a Grammy bot instance configured for the current environment
 */
export const createBot = (token: string): Bot => {
  if (isTestEnvironment) {
    return new Bot(token, {
      api: {
        apiRoot: getTelegramApiUrl(token).slice(0, -1), // Remove trailing slash
      },
    });
  }
  return new Bot(token);
};

/**
 * Validate bot token and create bot instance
 * @throws {Error} If TELEGRAM_BOT_TOKEN is not set
 */
export const createValidatedBot = (): Bot => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  return createBot(botToken);
}; 