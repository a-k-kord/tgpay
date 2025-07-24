import { useState, useCallback, useMemo } from 'react';
import { PaymentAPI } from '../api';
import { PaymentRequest, PaymentStatus } from '../types';

// Extend the Telegram WebApp interface
declare global {
    interface Window {
        Telegram?: {
            WebApp: {
                openInvoice: (url: string, callback: (status: string) => void) => void;
                initDataUnsafe: {
                    user?: {
                        id: number;
                        first_name: string;
                        last_name?: string;
                        username?: string;
                    };
                };
                ready: () => void;
                expand: () => void;
                MainButton: {
                    setText: (text: string) => void;
                    show: () => void;
                    hide: () => void;
                    onClick: (callback: () => void) => void;
                };
                HapticFeedback: {
                    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
                    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
                };
            };
        };
    }
}

export const usePayment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentStatus[]>([]);

    const paymentAPI = useMemo(() => new PaymentAPI(), []);

    const processPayment = useCallback(async (
        request: PaymentRequest,
        onSuccess?: (paymentId?: string) => void,
        onError?: (error: string) => void
    ) => {
        if (!window.Telegram?.WebApp) {
            const errorMsg = 'Telegram WebApp is not available. Please open this app from Telegram.';
            setError(errorMsg);
            onError?.(errorMsg);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create invoice via our API
            const { invoiceLink, paymentId } = await paymentAPI.createInvoice(request);

            // Open payment interface using Telegram WebApp SDK
            window.Telegram.WebApp.openInvoice(invoiceLink, (status: string) => {
                if (status === 'paid') {
                    // Provide haptic feedback
                    window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('success');
                    onSuccess?.(paymentId);
                } else if (status === 'cancelled') {
                    setError('Payment was cancelled');
                    onError?.('Payment was cancelled');
                } else if (status === 'failed') {
                    setError('Payment failed');
                    window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('error');
                    onError?.('Payment failed');
                }
                setLoading(false);
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown payment error';
            setError(errorMessage);
            onError?.(errorMessage);
            setLoading(false);
            window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('error');
        }
    }, [paymentAPI]);

    const getPaymentHistory = useCallback(async (userId: number) => {
        try {
            const history = await paymentAPI.getUserPayments(userId);
            setPaymentHistory(history);
            return history;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load payment history';
            setError(errorMessage);
            return [];
        }
    }, [paymentAPI]);

    const requestRefund = useCallback(async (paymentId: string) => {
        try {
            setLoading(true);
            const result = await paymentAPI.refundPayment(paymentId);
            setLoading(false);

            if (result.success) {
                window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('success');
            } else {
                window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('error');
            }

            return result;
        } catch (err) {
            setLoading(false);
            const errorMessage = err instanceof Error ? err.message : 'Refund request failed';
            setError(errorMessage);
            window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('error');
            throw new Error(errorMessage);
        }
    }, [paymentAPI]);

    const getTelegramUser = useCallback(() => {
        return window.Telegram?.WebApp?.initDataUnsafe?.user;
    }, []);

    return {
        loading,
        error,
        paymentHistory,
        processPayment,
        getPaymentHistory,
        requestRefund,
        getTelegramUser,
        clearError: () => setError(null)
    };
};