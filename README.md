# Telegram Stars Shop

A modern Next.js-based Telegram Mini App for selling digital products using Telegram Stars payment system. Built with Next.js 15, Tailwind CSS, and Grammy bot framework.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fakkord%2Ftgpay&env=TELEGRAM_BOT_TOKEN,NEXT_PUBLIC_BOT_USERNAME&project-name=telegram-stars-shop&repository-name=telegram-stars-shop)

## Key Features

✅ **Modern Telegram Mini App** with full WebApp SDK integration
✅ **Telegram Stars Payment System** using the latest 2025 best practices  
✅ **Complete Shop Interface** with 10 sample digital products
✅ **Payment Processing** organized in `src/features/payment/` as requested
✅ **Real-time Theme Integration** that adapts to user's Telegram theme
✅ **Payment History & Refunds** with proper tracking
✅ **Responsive Design** optimized for mobile Telegram interface

## Architecture Highlights

**Payment Features** (in `src/features/payment/`):
- Modern payment integration using `createInvoiceLink` and `WebApp.openInvoice`
- Proper handling of Telegram Stars (XTR currency) with pre-checkout validation
- React hooks for payment processing with success/error callbacks
- Payment history with refund capabilities
- TypeScript interfaces for type safety

**Technical Implementation**:
- Next.js 15 with App Router and API routes for webhook handling
- Grammy bot framework for Telegram Bot API integration
- Telegram WebApp SDK with React bindings
- Real invoice creation using bot.api.createInvoiceLink with proper Stars configuration

**Modern Payment Flow**:
1. User selects product → Frontend creates invoice via API
2. `WebApp.openInvoice()` opens Telegram's native payment interface
3. Bot webhook handles pre-checkout validation and successful payment events
4. Payment status updated with charge ID for refund capability
5. User receives confirmation and digital product access

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure environment**:
   - Copy `.env.example` to `.env.local`
   - Add your Telegram bot token
   - Configure other necessary environment variables

3. **Development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

4. **Bot Setup**:
   - Create a bot with [@BotFather](https://t.me/BotFather)
   - Enable payments and set up Stripe test credentials
   - Configure webhook URL pointing to `/api/webhook`
   - For local development, use ngrok or similar for HTTPS tunnel

## Project Structure

```
src/
├── app/                   # Next.js App Router pages and API routes
├── components/           # Shared React components
├── data/                # Product catalog and categories
├── features/
│   └── payment/         # Payment processing logic and components
├── providers/           # React context providers
└── lib/                # Utility functions and configurations
```

## Learn More

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [Next.js Documentation](https://nextjs.org/docs)
- [Grammy Bot Framework](https://grammy.dev)

## Deployment

The app is optimized for deployment on [Vercel](https://vercel.com). For other platforms, ensure:

1. Node.js 18+ environment
2. HTTPS endpoint for webhook
3. Proper environment variables configuration
4. WebApp URL configured in BotFather

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
