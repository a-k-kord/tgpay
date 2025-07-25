export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // Price in Telegram Stars
    image: string;
    category: string;
    inStock: boolean;
}

export interface PaymentRequest {
    productId: string;
    userId: number;
    quantity: number;
}

export interface PaymentResponse {
    invoiceLink: string;
    paymentId: string;
}

export interface PaymentStatus {
    paymentId: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    amount: number;
    productId: string;
    userId: number;
    createdAt: string;
    telegramPaymentChargeId?: string;
}

export interface CreateInvoiceRequest {
    title: string;
    description: string;
    payload: string;
    currency: 'XTR'; // Telegram Stars currency code
    prices: Array<{
        label: string;
        amount: number;
    }>;
}

export interface PaymentData {
    userId: number;
    productId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'paid';
    createdAt: string;
    paidAt?: string;
    chargeId?: string;
    error?: string;
    telegramPaymentChargeId?: string;
    totalAmount?: number;
}

export interface TelegramPaymentCallback {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export type PaymentStore = Map<string, PaymentData>;