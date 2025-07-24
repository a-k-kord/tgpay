'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePayment } from '../hooks/usePayment';
import { PaymentStatus } from '../types';
import { Star, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const PaymentHistory: React.FC = () => {
    const { getPaymentHistory, requestRefund, loading, getTelegramUser } = usePayment();
    const [payments, setPayments] = useState<PaymentStatus[]>([]);
    const [refundingId, setRefundingId] = useState<string | null>(null);

    const loadPaymentHistory = useCallback(async (userId: number) => {
        const history = await getPaymentHistory(userId);
        setPayments(history);
    }, [getPaymentHistory]);

    useEffect(() => {
        const user = getTelegramUser();
        if (user) {
            loadPaymentHistory(user.id);
        }
    }, [getTelegramUser, loadPaymentHistory]);

    const handleRefund = async (paymentId: string) => {
        try {
            setRefundingId(paymentId);
            const result = await requestRefund(paymentId);

            if (result.success) {
                // Refresh the payment history
                const user = getTelegramUser();
                if (user) {
                    await loadPaymentHistory(user.id);
                }
            }
        } finally {
            setRefundingId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'failed':
                return <XCircle className="text-red-500" size={20} />;
            case 'refunded':
                return <RefreshCw className="text-blue-500" size={20} />;
            case 'pending':
            default:
                return <Clock className="text-yellow-500" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'text-green-600 bg-green-50';
            case 'failed':
                return 'text-red-600 bg-red-50';
            case 'refunded':
                return 'text-blue-600 bg-blue-50';
            case 'pending':
            default:
                return 'text-yellow-600 bg-yellow-50';
        }
    };

    if (loading && payments.length === 0) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-telegram-button border-t-transparent rounded-full" />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="text-center p-8">
                <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-telegram-hint">No payment history found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-telegram-text">Payment History</h3>

            <div className="space-y-3">
                {payments.map((payment) => (
                    <div
                        key={payment.paymentId}
                        className="bg-telegram-secondary-bg rounded-lg p-4 border border-telegram-section-separator"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon(payment.status)}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                        {payment.status.toUpperCase()}
                                    </span>
                                </div>

                                <p className="text-telegram-text font-medium mb-1">
                                    Payment #{payment.paymentId.slice(-8)}
                                </p>

                                <div className="flex items-center gap-1 text-telegram-accent">
                                    <Star size={16} className="text-yellow-400 fill-current" />
                                    <span>{payment.amount} Stars</span>
                                </div>

                                <p className="text-telegram-hint text-sm mt-1">
                                    {new Date(payment.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {payment.status === 'paid' && (
                                <button
                                    onClick={() => handleRefund(payment.paymentId)}
                                    disabled={refundingId === payment.paymentId}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                                >
                                    {refundingId === payment.paymentId ? (
                                        <div className="flex items-center gap-1">
                                            <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                                            <span>Refunding...</span>
                                        </div>
                                    ) : (
                                        'Request Refund'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};