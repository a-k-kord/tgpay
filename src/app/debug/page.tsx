'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

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

export default function DebugPage() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [webhookLoading, setWebhookLoading] = useState(false);
    const [settingWebhook, setSettingWebhook] = useState(false);

    const fetchDebugInfo = async () => {
        setLoading(true);
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
            setLoading(false);
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

    useEffect(() => {
        fetchDebugInfo();
        fetchWebhookInfo();
    }, []);

    const botUsername = debugInfo?.bot?.username;
    const telegramLink = botUsername ? `https://t.me/${botUsername}` : null;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Bot Debug Info</h1>
                        <button
                            onClick={fetchDebugInfo}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {debugInfo ? (
                        <div className="space-y-6">
                            {/* Bot Status */}
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    {debugInfo.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <h2 className="text-lg font-semibold">Bot Configuration</h2>
                                </div>

                                {debugInfo.success && debugInfo.bot ? (
                                    <div className="space-y-2 text-sm">
                                        <div><strong>ID:</strong> {debugInfo.bot.id}</div>
                                        <div><strong>Username:</strong> @{debugInfo.bot.username}</div>
                                        <div><strong>Name:</strong> {debugInfo.bot.first_name}</div>
                                        <div><strong>Can Join Groups:</strong> {debugInfo.bot.can_join_groups ? 'Yes' : 'No'}</div>
                                        <div><strong>Inline Queries:</strong> {debugInfo.bot.supports_inline_queries ? 'Yes' : 'No'}</div>
                                    </div>
                                ) : (
                                    <div className="text-red-600">
                                        <strong>Error:</strong> {debugInfo.error}
                                    </div>
                                )}
                            </div>

                            {/* Telegram Link */}
                            {telegramLink && (
                                <div className="border rounded-lg p-4 bg-blue-50">
                                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <ExternalLink className="w-5 h-5" />
                                        Open Bot in Telegram
                                    </h2>
                                    <a
                                        href={telegramLink}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span>Open @{debugInfo.bot?.username}</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Click this link to open the bot in Telegram and test payments
                                    </p>
                                </div>
                            )}

                            {/* Payment Test */}
                            <div className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    {debugInfo.invoice_test?.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <h2 className="text-lg font-semibold">Stars Payment Test</h2>
                                </div>

                                {debugInfo.invoice_test ? (
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Status:</strong>
                                            <span className={debugInfo.invoice_test.success ? 'text-green-600' : 'text-red-600'}>
                                                {debugInfo.invoice_test.success ? ' Working ✅' : ' Failed ❌'}
                                            </span>
                                        </div>
                                        {debugInfo.invoice_test.error && (
                                            <div className="text-red-600">
                                                <strong>Error:</strong> {debugInfo.invoice_test.error}
                                            </div>
                                        )}
                                        {debugInfo.invoice_test.result && (
                                            <div className="text-green-600">
                                                <strong>Invoice Link:</strong>
                                                <div className="break-all text-xs mt-1 p-2 bg-gray-100 rounded">
                                                    {debugInfo.invoice_test.result}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500">No payment test data</div>
                                )}
                            </div>

                            {/* Environment Info */}
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <h2 className="text-lg font-semibold mb-3">Environment</h2>
                                <div className="space-y-2 text-sm">
                                    <div><strong>Mode:</strong> {debugInfo.environment}</div>
                                    <div><strong>Test Environment:</strong> {debugInfo.is_test_env || 'false'}</div>
                                </div>
                            </div>

                            {/* Webhook Info */}
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    Webhook Configuration
                                    <button
                                        onClick={fetchWebhookInfo}
                                        disabled={webhookLoading}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
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
                                </h2>
                                {webhookInfo ? (
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            {webhookInfo.isWebhookSet ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500" />
                                            )}
                                            <span><strong>Status:</strong> {webhookInfo.isWebhookSet ? 'Set' : 'Not Set'}</span>
                                        </div>

                                        {webhookInfo.webhookInfo?.url && (
                                            <div>
                                                <strong>Current URL:</strong>
                                                <div className="break-all text-xs mt-1 p-2 bg-gray-100 rounded">
                                                    {webhookInfo.webhookInfo.url}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <strong>Expected URL:</strong>
                                            <div className="break-all text-xs mt-1 p-2 bg-gray-100 rounded">
                                                {webhookInfo.expectedWebhookUrl}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {webhookInfo.webhookUrlMatches ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500" />
                                            )}
                                            <span><strong>URL Match:</strong> {webhookInfo.webhookUrlMatches ? 'Yes' : 'No'}</span>
                                        </div>

                                        <div><strong>Pending Updates:</strong> {webhookInfo.pendingUpdateCount}</div>

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
                                    <div className="text-gray-500">Loading webhook info...</div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="border rounded-lg p-4 bg-yellow-50">
                                <h2 className="text-lg font-semibold mb-3">Next Steps</h2>
                                <div className="space-y-2 text-sm">
                                    {debugInfo.invoice_test?.success ? (
                                        <div className="text-green-700">
                                            ✅ Bot is configured correctly for Stars payments!<br />
                                            You can now test payments in the Mini App.
                                        </div>
                                    ) : (
                                        <div className="text-amber-700">
                                            <p>❌ Bot payment setup needs attention:</p>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
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
                    ) : (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 