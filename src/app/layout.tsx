import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TelegramProvider } from '../providers/TelegramProvider';
import { WebhookAutoSetup } from '@/components/WebhookAutoSetup';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: 'Telegram Stars Shop',
    description: 'Digital marketplace for Telegram with Stars payment integration',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <TelegramProvider>
                    <WebhookAutoSetup />
                    {children}
                </TelegramProvider>
            </body>
        </html>
    );
}