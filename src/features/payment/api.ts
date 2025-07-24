import { PaymentRequest, PaymentResponse, PaymentStatus } from './types';

export class PaymentAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = '/api';
  }

  async createInvoice(request: PaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseURL}/payment/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Payment API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const response = await fetch(`${this.baseURL}/payment/status/${paymentId}`);
    
    if (!response.ok) {
      throw new Error(`Payment status error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserPayments(userId: number): Promise<PaymentStatus[]> {
    const response = await fetch(`${this.baseURL}/payment/history/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Payment history error: ${response.statusText}`);
    }

    return response.json();
  }

  async refundPayment(paymentId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/payment/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId }),
    });

    if (!response.ok) {
      throw new Error(`Refund error: ${response.statusText}`);
    }

    return response.json();
  }
}