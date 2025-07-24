'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Script from 'next/script';

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

interface TelegramThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
    accent_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    section_separator_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
}

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: TelegramUser;
        start_param?: string;
    };
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: TelegramThemeParams;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    ready: () => void;
    expand: () => void;
    close: () => void;
    openInvoice: (url: string, callback: (status: string) => void) => void;
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isProgressVisible: boolean;
        isActive: boolean;
        setText: (text: string) => void;
        onClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
        showProgress: (leaveActive?: boolean) => void;
        hideProgress: () => void;
    };
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
    };
}

interface TelegramContextType {
    webApp: TelegramWebApp | null;
    user: TelegramUser | null;
    isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
    webApp: null,
    user: null,
    isReady: false,
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
    children: React.ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
    const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initTelegram = () => {
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp as TelegramWebApp;

                // Initialize Telegram WebApp
                tg.ready();
                tg.expand();

                setWebApp(tg);
                setIsReady(true);

                // Apply Telegram theme
                document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
                document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
                document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
                document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
                document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f1f1f1');
                document.documentElement.style.setProperty('--tg-theme-header-bg-color', tg.themeParams.header_bg_color || '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-accent-text-color', tg.themeParams.accent_text_color || '#2481cc');
                document.documentElement.style.setProperty('--tg-theme-section-bg-color', tg.themeParams.section_bg_color || '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-section-header-text-color', tg.themeParams.section_header_text_color || '#6d6d71');
                document.documentElement.style.setProperty('--tg-theme-section-separator-color', tg.themeParams.section_separator_color || '#c8c7cc');
                document.documentElement.style.setProperty('--tg-theme-subtitle-text-color', tg.themeParams.subtitle_text_color || '#999999');
                document.documentElement.style.setProperty('--tg-theme-destructive-text-color', tg.themeParams.destructive_text_color || '#ff3b30');

                console.log('Telegram WebApp initialized:', tg);
            }
        };

        // Try to initialize immediately if Telegram is already available
        initTelegram();

        // Also listen for the script load event
        const handleScriptLoad = () => {
            setTimeout(initTelegram, 100);
        };

        window.addEventListener('TelegramWebAppReady', handleScriptLoad);

        return () => {
            window.removeEventListener('TelegramWebAppReady', handleScriptLoad);
        };
    }, []);

    const value: TelegramContextType = {
        webApp,
        user: webApp?.initDataUnsafe?.user || null,
        isReady,
    };

    return (
        <TelegramContext.Provider value={value}>
            <Script
                src="https://telegram.org/js/telegram-web-app.js"
                strategy="afterInteractive"
                onLoad={() => {
                    window.dispatchEvent(new Event('TelegramWebAppReady'));
                }}
            />
            <div className="min-h-screen bg-telegram-bg text-telegram-text">
                {children}
            </div>
        </TelegramContext.Provider>
    );
};