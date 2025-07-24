'use client';

import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { PaymentHistory } from '../features/payment/components/PaymentHistory';
import { useTelegram } from '../providers/TelegramProvider';
import { products, categories, getProductsByCategory } from '../data/products';
import { ShoppingBag, History, User, Star, Filter, RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

type TabType = 'shop' | 'history' | 'profile';

interface DebugInfo {
    success: boolean;
    bot?: {
        id: number;
        username: string;
        first_name: string;
        can_join_groups: boolean;
        can_read_all_group_messages: boolean;
        supports_inline_queries: boolean;
    };
    invoice_test?: {
        success: boolean;
        result?: string;
        error?: string;
    };
    environment?: string;
    is_test_env?: string;
    error?: string;
}

interface WebhookInfo {
    webhookInfo?: {
        url: string;
        has_custom_certificate: boolean;
        pending_update_count: number;
        ip_address?: string;
        last_error_date?: number;
        last_error_message?: string;
        max_connections?: number;
        allowed_updates?: string[];
    };
    expectedWebhookUrl: string;
    environment: string;
    vercelUrl?: string;
    isWebhookSet: boolean;
    webhookUrlMatches: boolean;
    pendingUpdateCount: number;
    lastErrorDate?: number;
    lastErrorMessage?: string;
    maxConnections?: number;
}

export default function Home() {
    const { webApp, user, isReady } = useTelegram();
    const [activeTab, setActiveTab] = useState<TabType>('shop');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState(products);

    // Debug state
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
    const [debugLoading, setDebugLoading] = useState(false);
    const [webhookLoading, setWebhookLoading] = useState(false);
    const [settingWebhook, setSettingWebhook] = useState(false);

    useEffect(() => {
        if (webApp) {
            // Configure Telegram WebApp
            webApp.ready();
            webApp.expand();

            // Set header color to match theme
            if (webApp.themeParams.header_bg_color) {
                document.documentElement.style.setProperty(
                    '--tg-theme-header-bg-color',
                    webApp.themeParams.header_bg_color
                );
            }
        }
    }, [webApp]);

    useEffect(() => {
        const filtered = getProductsByCategory(selectedCategory);
        setFilteredProducts(filtered);
    }, [selectedCategory]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        // Provide haptic feedback
        webApp?.HapticFeedback?.selectionChanged();

        // Load debug info when switching to profile tab
        if (tab === 'profile' && !debugInfo) {
            fetchDebugInfo();
            fetchWebhookInfo();
        }
    };

    // Debug functions
    const fetchDebugInfo = async () => {
        setDebugLoading(true);
        try {
            const response = await fetch('/api/debug');
            const data = await response.json();
            setDebugInfo(data);
        } catch {
            setDebugInfo({
                success: false,
                error: 'Failed to fetch debug info'
            });
        } finally {
            setDebugLoading(false);
        }
    };

    const fetchWebhookInfo = async () => {
        setWebhookLoading(true);
        try {
            const response = await fetch('/api/webhook-info');
            const data = await response.json();
            setWebhookInfo(data);
        } catch (error) {
            console.error('Failed to fetch webhook info:', error);
        }
        setWebhookLoading(false);
    };

    const setWebhook = async () => {
        setSettingWebhook(true);
        try {
            const response = await fetch('/api/set-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const result = await response.json();

            if (result.success) {
                alert('Webhook set successfully! The bot should now receive payment updates.');
                fetchWebhookInfo(); // Refresh webhook info
            } else {
                alert(`Failed to set webhook: ${result.error}`);
            }
        } catch (error) {
            console.error('Failed to set webhook:', error);
            alert('Failed to set webhook. Check console for details.');
        }
        setSettingWebhook(false);
    };

    const renderShopTab = () => (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                <h1 className="text-2xl font-bold mb-2">Welcome to Digital Shop!</h1>
                <p className="text-blue-100">
                    Discover premium digital products and pay securely with Telegram Stars
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <Star size={20} className="text-yellow-300 fill-current" />
                    <span className="text-sm">Pay with Telegram Stars • Instant Access • Secure</span>
                </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-telegram-hint" />
                    <h3 className="font-medium text-telegram-text">Categories</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap btn-scale ${selectedCategory === category
                                ? 'bg-telegram-button text-telegram-button-text'
                                : 'bg-telegram-secondary-bg text-telegram-text hover:bg-telegram-section-separator'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-telegram-hint">No products found in this category</p>
                </div>
            )}
        </div>
    );

    const renderHistoryTab = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <History size={24} className="text-telegram-button" />
                <h2 className="text-xl font-semibold text-telegram-text">Payment History</h2>
            </div>
            <PaymentHistory />
        </div>
    );

    const renderProfileTab = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <User size={24} className="text-telegram-button" />
                <h2 className="text-xl font-semibold text-telegram-text">Profile</h2>
            </div>

            {user ? (
                <div className="bg-telegram-secondary-bg rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-telegram-button rounded-full flex items-center justify-center">
                            <span className="text-2xl text-telegram-button-text font-bold">
                                {user.first_name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-telegram-text">
                                {user.first_name} {user.last_name || ''}
                            </h3>
                            {user.username && (
                                <p className="text-telegram-hint">@{user.username}</p>
                            )}
                            {user.is_premium && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                                    <Star size={12} className="fill-current" />
                                    Premium
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-telegram-section-separator">
                        <h4 className="font-medium text-telegram-text mb-2">Account Information</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-telegram-hint">User ID:</span>
                                <span className="text-telegram-text">{user.id}</span>
                            </div>
                            {user.language_code && (
                                <div className="flex justify-between">
                                    <span className="text-telegram-hint">Language:</span>
                                    <span className="text-telegram-text">{user.language_code.toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <User size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-telegram-hint">
                        Please open this app from Telegram to view your profile
                    </p>
                </div>
            )}

            {/* App Information */}
            <div className="bg-telegram-secondary-bg rounded-lg p-6 space-y-3">
                <h4 className="font-medium text-telegram-text">About This App</h4>
                <div className="space-y-2 text-sm text-telegram-hint">
                    <p>• Digital marketplace for premium content</p>
                    <p>• Secure payments with Telegram Stars</p>
                    <p>• Instant access to purchased items</p>
                    <p>• Built with Next.js and Telegram Mini Apps</p>
                </div>
            </div>

            {/* Bot Debug Info */}
            <div className="bg-telegram-secondary-bg rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-telegram-text">Bot Debug Info</h4>
                    <button
                        onClick={fetchDebugInfo}
                        disabled={debugLoading}
                        className="flex items-center gap-1 px-3 py-1 bg-telegram-button text-telegram-button-text text-xs rounded hover:opacity-90 disabled:opacity-50"
                    >
                        {debugLoading ? (
                            <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                        ) : (
                            <RefreshCw size={12} />
                        )}
                        Refresh
                    </button>
                </div>

                {debugInfo ? (
                    <div className="space-y-4">
                        {/* Bot Configuration */}
                        <div className="border border-telegram-section-separator rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-telegram-text mb-3 flex items-center gap-2">
                                Bot Configuration
                                {debugInfo.success ? (
                                    <CheckCircle size={16} className="text-green-500" />
                                ) : (
                                    <XCircle size={16} className="text-red-500" />
                                )}
                            </h5>
                            {debugInfo.bot ? (
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-telegram-hint">ID:</span>
                                        <span className="text-telegram-text">{debugInfo.bot.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-telegram-hint">Username:</span>
                                        <span className="text-telegram-text">@{debugInfo.bot.username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-telegram-hint">Name:</span>
                                        <span className="text-telegram-text">{debugInfo.bot.first_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-telegram-hint">Groups:</span>
                                        <span className="text-telegram-text">{debugInfo.bot.can_join_groups ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-telegram-hint">Inline:</span>
                                        <span className="text-telegram-text">{debugInfo.bot.supports_inline_queries ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-red-600 text-xs">{debugInfo.error}</div>
                            )}

                            {debugInfo.bot?.username && (
                                <div className="mt-3 pt-3 border-t border-telegram-section-separator">
                                    <a
                                        href={`https://t.me/${debugInfo.bot.username}`}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span>Open @{debugInfo.bot.username}</span>
                                        <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Payment Test */}
                        <div className="border border-telegram-section-separator rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-telegram-text mb-3 flex items-center gap-2">
                                Stars Payment Test
                                {debugInfo.invoice_test?.success ? (
                                    <CheckCircle size={16} className="text-green-500" />
                                ) : (
                                    <XCircle size={16} className="text-red-500" />
                                )}
                            </h5>
                            {debugInfo.invoice_test ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-telegram-hint">Status:</span>
                                        <span className={debugInfo.invoice_test.success ? 'text-green-600' : 'text-red-600'}>
                                            {debugInfo.invoice_test.success ? 'Working ✅' : 'Failed ❌'}
                                        </span>
                                    </div>
                                    {debugInfo.invoice_test.success && debugInfo.invoice_test.result && (
                                        <div className="text-xs">
                                            <span className="text-telegram-hint">Invoice Link:</span>
                                            <div className="break-all p-2 bg-gray-100 rounded mt-1 text-gray-700">
                                                {debugInfo.invoice_test.result}
                                            </div>
                                        </div>
                                    )}
                                    {debugInfo.invoice_test.error && (
                                        <div className="text-red-600 text-xs">{debugInfo.invoice_test.error}</div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-xs">No payment test data</div>
                            )}
                        </div>

                        {/* Environment Info */}
                        <div className="border border-telegram-section-separator rounded-lg p-4">
                            <h5 className="text-sm font-semibold text-telegram-text mb-3">Environment</h5>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-telegram-hint">Mode:</span>
                                    <span className="text-telegram-text">{debugInfo.environment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-telegram-hint">Test Environment:</span>
                                    <span className="text-telegram-text">{debugInfo.is_test_env || 'false'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-telegram-hint text-sm">Click Refresh to load debug information</div>
                )}
            </div>

            {/* Webhook Configuration */}
            <div className="bg-telegram-secondary-bg rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-telegram-text">Webhook Configuration</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchWebhookInfo}
                            disabled={webhookLoading}
                            className="flex items-center gap-1 px-3 py-1 bg-telegram-button text-telegram-button-text text-xs rounded hover:opacity-90 disabled:opacity-50"
                        >
                            {webhookLoading ? (
                                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                            ) : (
                                <RefreshCw size={12} />
                            )}
                            Refresh
                        </button>
                        {webhookInfo && !webhookInfo.isWebhookSet && (
                            <button
                                onClick={setWebhook}
                                disabled={settingWebhook}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                {settingWebhook ? (
                                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                                ) : (
                                    '🔧'
                                )}
                                Set Webhook
                            </button>
                        )}
                    </div>
                </div>

                {webhookInfo ? (
                    <div className="space-y-3 text-xs">
                        <div className="flex items-center gap-2">
                            {webhookInfo.isWebhookSet ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <XCircle size={16} className="text-red-500" />
                            )}
                            <span className="text-telegram-text"><strong>Status:</strong> {webhookInfo.isWebhookSet ? 'Set' : 'Not Set'}</span>
                        </div>

                        {webhookInfo.webhookInfo?.url && (
                            <div>
                                <strong className="text-telegram-text">Current URL:</strong>
                                <div className="break-all mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                    {webhookInfo.webhookInfo.url}
                                </div>
                            </div>
                        )}

                        <div>
                            <strong className="text-telegram-text">Expected URL:</strong>
                            <div className="break-all mt-1 p-2 bg-gray-100 rounded text-gray-700">
                                {webhookInfo.expectedWebhookUrl}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {webhookInfo.webhookUrlMatches ? (
                                <CheckCircle size={16} className="text-green-500" />
                            ) : (
                                <XCircle size={16} className="text-red-500" />
                            )}
                            <span className="text-telegram-text"><strong>URL Match:</strong> {webhookInfo.webhookUrlMatches ? 'Yes' : 'No'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-telegram-hint">Pending Updates:</span>
                            <span className="text-telegram-text">{webhookInfo.pendingUpdateCount}</span>
                        </div>

                        {webhookInfo.lastErrorMessage && (
                            <div className="text-red-600">
                                <strong>Last Error:</strong> {webhookInfo.lastErrorMessage}
                                {webhookInfo.lastErrorDate && (
                                    <div className="text-xs">
                                        {new Date(webhookInfo.lastErrorDate * 1000).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-telegram-hint text-sm">Click Refresh to load webhook information</div>
                )}
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Debug Status</h4>
                <div className="text-sm text-yellow-700">
                    {debugInfo?.invoice_test?.success ? (
                        <div>
                            ✅ Bot is configured correctly for Stars payments!<br />
                            You can now test payments in the Mini App.
                        </div>
                    ) : (
                        <div>
                            <p>❌ Bot payment setup needs attention:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                                <li>Check if bot token is valid</li>
                                <li>Ensure you&apos;re using the correct environment (test/production)</li>
                                <li>Verify bot has necessary permissions</li>
                                <li>Check webhook configuration above</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-3 border-telegram-button border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-telegram-hint">Loading Telegram WebApp...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-telegram-bg">
            {/* Main Content */}
            <main className="pb-24">
                <div className="max-w-4xl mx-auto p-4">
                    {activeTab === 'shop' && renderShopTab()}
                    {activeTab === 'history' && renderHistoryTab()}
                    {activeTab === 'profile' && renderProfileTab()}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-telegram-secondary-bg border-t border-telegram-section-separator telegram-safe-area backdrop-blur-md bg-opacity-95 z-50">
                <div className="flex">
                    {[
                        { id: 'shop', label: 'Shop', icon: ShoppingBag },
                        { id: 'history', label: 'History', icon: History },
                        { id: 'profile', label: 'Profile', icon: User },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => handleTabChange(id as TabType)}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 btn-scale ${activeTab === id
                                ? 'text-telegram-button'
                                : 'text-telegram-hint hover:text-telegram-text'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}