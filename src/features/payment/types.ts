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

export interface TelegramPaymentCallback {
  status: 'paid' | 'cancelled' | 'failed' | 'pending';
}